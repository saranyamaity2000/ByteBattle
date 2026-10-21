package gateway

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sync"
	"testing"
)

type receivedRequest struct {
	path    string
	headers http.Header
}

func TestRoutesBrowserTrafficAndStripsForgedIdentityHeaders(t *testing.T) {
	t.Parallel()

	var mutex sync.Mutex
	received := make(map[string][]receivedRequest)
	newUpstream := func(name string) *httptest.Server {
		return httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			mutex.Lock()
			received[name] = append(received[name], receivedRequest{
				path:    request.URL.RequestURI(),
				headers: request.Header.Clone(),
			})
			mutex.Unlock()
			writer.WriteHeader(http.StatusNoContent)
		}))
	}

	problem := newUpstream("problem")
	t.Cleanup(problem.Close)
	submission := newUpstream("submission")
	t.Cleanup(submission.Close)
	battle := newUpstream("battle")
	t.Cleanup(battle.Close)

	handler, err := NewHandler(testConfig(problem.URL, submission.URL, battle.URL))
	if err != nil {
		t.Fatal(err)
	}
	gateway := httptest.NewServer(handler)
	t.Cleanup(gateway.Close)

	testCases := []struct {
		name         string
		requestPath  string
		upstreamPath string
		upstream     string
	}{
		{
			name:         "problem REST",
			requestPath:  "/problem-service/api/v1/problems/example",
			upstreamPath: "/api/v1/problems/example",
			upstream:     "problem",
		},
		{
			name:         "submission REST",
			requestPath:  "/submission-service/api/v1/submissions",
			upstreamPath: "/api/v1/submissions",
			upstream:     "submission",
		},
		{
			name:         "battle REST",
			requestPath:  "/battle-ws-service/api/v1/challenges/ongoing",
			upstreamPath: "/api/v1/challenges/ongoing",
			upstream:     "battle",
		},
		{
			name:         "Socket.IO",
			requestPath:  "/battle-ws-service/socket.io/?EIO=4&transport=polling",
			upstreamPath: "/socket.io/?EIO=4&transport=polling",
			upstream:     "battle",
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			request, err := http.NewRequest(http.MethodGet, gateway.URL+testCase.requestPath, nil)
			if err != nil {
				t.Fatal(err)
			}
			request.Header.Set("X-User-ID", "forged-user")
			request.Header.Set("X-User-Email", "forged@example.com")
			request.Header.Set("X-User-Role", "admin")
			request.Header.Set("X-Request-ID", "forged-request-id")
			request.Header.Set("X-Forwarded-For", "forged-client")
			request.Header.Set("Connection", "X-Request-ID")

			response, err := http.DefaultClient.Do(request)
			if err != nil {
				t.Fatal(err)
			}
			response.Body.Close()
			if response.StatusCode != http.StatusNoContent {
				t.Fatalf("status = %d, want %d", response.StatusCode, http.StatusNoContent)
			}

			mutex.Lock()
			upstreamRequests := received[testCase.upstream]
			lastRequest := upstreamRequests[len(upstreamRequests)-1]
			mutex.Unlock()
			if lastRequest.path != testCase.upstreamPath {
				t.Fatalf("upstream path = %q, want %q", lastRequest.path, testCase.upstreamPath)
			}
			for _, header := range []string{"X-User-ID", "X-User-Email", "X-User-Role"} {
				if value := lastRequest.headers.Get(header); value != "" {
					t.Errorf("%s = %q, want stripped header", header, value)
				}
			}
			if requestID := lastRequest.headers.Get("X-Request-ID"); requestID == "" || requestID == "forged-request-id" {
				t.Errorf("X-Request-ID = %q, want a gateway-generated ID", requestID)
			}
			if forwardedFor := lastRequest.headers.Get("X-Forwarded-For"); forwardedFor == "forged-client" {
				t.Errorf("X-Forwarded-For = %q, want gateway-generated forwarding header", forwardedFor)
			}
		})
	}
}

func TestRejectsUnmappedPaths(t *testing.T) {
	t.Parallel()

	handler, err := NewHandler(testConfig(
		"http://problem-service:3001",
		"http://submission-service:3000",
		"http://battle-ws-service:3101",
	))
	if err != nil {
		t.Fatal(err)
	}
	gateway := httptest.NewServer(handler)
	t.Cleanup(gateway.Close)

	response, err := http.Get(gateway.URL + "/api/v1/unknown")
	if err != nil {
		t.Fatal(err)
	}
	response.Body.Close()
	if response.StatusCode != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", response.StatusCode, http.StatusNotFound)
	}
}

func TestLoadConfig(t *testing.T) {
	t.Parallel()

	configFile := filepath.Join(t.TempDir(), "config.yaml")
	configContents := `
listenAddress: ":8080"
upstreams:
  problem-service: http://problem-service:3001
routes:
  - prefix: /problem-service
    upstream: problem-service
`
	if err := os.WriteFile(configFile, []byte(configContents), 0o600); err != nil {
		t.Fatal(err)
	}

	config, err := LoadConfig(configFile)
	if err != nil {
		t.Fatal(err)
	}
	if config.ListenAddress != ":8080" {
		t.Errorf("listen address = %q, want :8080", config.ListenAddress)
	}
	if got := config.Upstreams["problem-service"]; got != "http://problem-service:3001" {
		t.Errorf("problem upstream = %q, want http://problem-service:3001", got)
	}
	if got := config.Routes[0]; got != (RouteConfig{
		Prefix:   "/problem-service",
		Upstream: "problem-service",
	}) {
		t.Errorf("route = %#v, want configured problem route", got)
	}
}

func TestLoadConfigRejectsUnknownUpstream(t *testing.T) {
	t.Parallel()

	configFile := filepath.Join(t.TempDir(), "config.yaml")
	configContents := `
listenAddress: ":8080"
routes:
  - prefix: /problem-service
    upstream: missing-service
`
	if err := os.WriteFile(configFile, []byte(configContents), 0o600); err != nil {
		t.Fatal(err)
	}

	if _, err := LoadConfig(configFile); err == nil {
		t.Fatal("LoadConfig() error = nil, want unknown upstream error")
	}
}

func testConfig(problemURL, submissionURL, battleURL string) Config {
	return Config{
		ListenAddress: ":8080",
		Upstreams: map[string]string{
			"problem-service":    problemURL,
			"submission-service": submissionURL,
			"battle-ws-service":  battleURL,
		},
		Routes: []RouteConfig{
			{Prefix: "/problem-service", Upstream: "problem-service"},
			{Prefix: "/submission-service", Upstream: "submission-service"},
			{Prefix: "/battle-ws-service", Upstream: "battle-ws-service"},
		},
	}
}

func TestComposeKeepsDomainServicesPrivate(t *testing.T) {
	t.Parallel()

	_, testFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("resolve test file path")
	}
	composeFile := filepath.Clean(filepath.Join(filepath.Dir(testFile), "../../../docker-compose.yaml"))
	command := exec.Command("docker", "compose", "-f", composeFile, "config", "--format", "json")
	command.Env = append(
		os.Environ(),
		"X_API_KEY=test-internal-api-key",
		"VITE_SUPABASE_URL=https://test.supabase.co",
		"VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=test-key",
	)
	output, err := command.Output()
	if err != nil {
		t.Fatalf("resolve Compose configuration: %v", err)
	}

	var topology struct {
		Services map[string]struct {
			Ports []json.RawMessage `json:"ports"`
		} `json:"services"`
	}
	if err := json.Unmarshal(output, &topology); err != nil {
		t.Fatalf("decode resolved Compose configuration: %v", err)
	}

	for _, service := range []string{"problem-service", "submission-service", "battle-ws-service"} {
		serviceConfig, exists := topology.Services[service]
		if !exists {
			t.Errorf("%s is missing from the resolved Compose configuration", service)
			continue
		}
		if ports := serviceConfig.Ports; len(ports) != 0 {
			t.Errorf("%s publishes %d host port(s), want none", service, len(ports))
		}
	}
}
