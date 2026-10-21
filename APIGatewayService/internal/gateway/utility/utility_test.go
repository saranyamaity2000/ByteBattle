package utility

import (
	"encoding/hex"
	"net/http"
	"testing"
)

func TestMatchesPrefix(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		path   string
		prefix string
		want   bool
	}{
		{path: "/api/v1/problems", prefix: "/api/v1/problems", want: true},
		{path: "/api/v1/problems/example", prefix: "/api/v1/problems", want: true},
		{path: "/api/v1/problems-extra", prefix: "/api/v1/problems", want: false},
	}

	for _, testCase := range testCases {
		if got := MatchesPrefix(testCase.path, testCase.prefix); got != testCase.want {
			t.Errorf("MatchesPrefix(%q, %q) = %t, want %t", testCase.path, testCase.prefix, got, testCase.want)
		}
	}
}

func TestStripIdentityHeaders(t *testing.T) {
	t.Parallel()

	header := make(http.Header)
	header.Set("X-User-ID", "forged-user")
	header.Set("X-USER-Role", "admin")
	header.Set("X-Request-ID", "request-id")

	StripIdentityHeaders(header)

	if got := header.Get("X-User-ID"); got != "" {
		t.Errorf("X-User-ID = %q, want stripped header", got)
	}
	if got := header.Get("X-USER-Role"); got != "" {
		t.Errorf("X-USER-Role = %q, want stripped header", got)
	}
	if got := header.Get("X-Request-ID"); got != "request-id" {
		t.Errorf("X-Request-ID = %q, want request-id", got)
	}
}

func TestStripForwardingHeaders(t *testing.T) {
	t.Parallel()

	header := make(http.Header)
	header.Set("Forwarded", "for=forged-client")
	header.Set("X-Forwarded-For", "forged-client")
	header.Set("X-Forwarded-Host", "forged-host")
	header.Set("X-Forwarded-Proto", "https")

	StripForwardingHeaders(header)

	for _, key := range []string{"Forwarded", "X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Proto"} {
		if got := header.Get(key); got != "" {
			t.Errorf("%s = %q, want stripped header", key, got)
		}
	}
}

func TestNewRequestID(t *testing.T) {
	t.Parallel()

	requestID := NewRequestID()
	decoded, err := hex.DecodeString(requestID)
	if err != nil {
		t.Fatalf("NewRequestID() = %q, want hexadecimal encoding: %v", requestID, err)
	}
	if len(decoded) != 16 {
		t.Errorf("NewRequestID() decoded length = %d, want 16", len(decoded))
	}
}

func TestParseURL(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name    string
		rawURL  string
		wantErr bool
	}{
		{name: "valid upstream", rawURL: "http://problem-service:3001"},
		{name: "missing scheme", rawURL: "problem-service:3001", wantErr: true},
		{name: "missing host", rawURL: "http://", wantErr: true},
	}

	for _, testCase := range testCases {
		testCase := testCase
		t.Run(testCase.name, func(t *testing.T) {
			t.Parallel()

			_, err := ParseURL(testCase.rawURL)
			if (err != nil) != testCase.wantErr {
				t.Errorf("ParseURL(%q) error = %v, wantErr %t", testCase.rawURL, err, testCase.wantErr)
			}
		})
	}
}
