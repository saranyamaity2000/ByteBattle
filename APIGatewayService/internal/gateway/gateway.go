package gateway

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/saranyamaity2000/ByteBattle/APIGatewayService/internal/gateway/utility"
	"gopkg.in/yaml.v3"
)

type Config struct {
	ListenAddress string            `yaml:"listenAddress"`
	Upstreams     map[string]string `yaml:"upstreams"`
	Routes        []RouteConfig     `yaml:"routes"`
}

type RouteConfig struct {
	Prefix   string `yaml:"prefix"`
	Upstream string `yaml:"upstream"`
}

func LoadConfig(path string) (Config, error) {
	configBytes, err := os.ReadFile(path)
	if err != nil {
		return Config{}, fmt.Errorf("read gateway configuration: %w", err)
	}

	var config Config
	if err := yaml.Unmarshal(configBytes, &config); err != nil {
		return Config{}, fmt.Errorf("parse gateway configuration: %w", err)
	}
	if err := validateConfig(config); err != nil {
		return Config{}, err
	}
	return config, nil
}

func NewHandler(config Config) (http.Handler, error) {
	if err := validateConfig(config); err != nil {
		return nil, err
	}

	proxies := make([]struct {
		prefix string
		proxy  *httputil.ReverseProxy
	}, len(config.Routes))
	for index, configuredRoute := range config.Routes {
		upstream, err := utility.ParseURL(config.Upstreams[configuredRoute.Upstream])
		if err != nil {
			return nil, err
		}
		proxies[index].prefix = configuredRoute.Prefix
		proxies[index].proxy = newProxy(upstream, configuredRoute.Prefix)
	}

	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		for _, proxy := range proxies {
			if utility.MatchesPrefix(request.URL.Path, proxy.prefix) {
				proxy.proxy.ServeHTTP(writer, request)
				return
			}
		}
		http.NotFound(writer, request)
	}), nil
}

func validateConfig(config Config) error {
	if config.ListenAddress == "" {
		return fmt.Errorf("gateway configuration requires listenAddress")
	}
	if len(config.Routes) == 0 {
		return fmt.Errorf("gateway configuration requires at least one route")
	}
	routedUpstreams := make(map[string]struct{}, len(config.Routes))
	for _, configuredRoute := range config.Routes {
		if !strings.HasPrefix(configuredRoute.Prefix, "/") {
			return fmt.Errorf("route prefix %q must start with /", configuredRoute.Prefix)
		}
		rawURL, exists := config.Upstreams[configuredRoute.Upstream]
		if !exists {
			return fmt.Errorf("route %q references unknown upstream %q", configuredRoute.Prefix, configuredRoute.Upstream)
		}
		if _, err := utility.ParseURL(rawURL); err != nil {
			return fmt.Errorf("upstream %q: %w", configuredRoute.Upstream, err)
		}
		if _, exists := routedUpstreams[configuredRoute.Upstream]; exists {
			return fmt.Errorf("upstream %q has multiple route prefixes", configuredRoute.Upstream)
		}
		routedUpstreams[configuredRoute.Upstream] = struct{}{}
	}
	for upstream := range config.Upstreams {
		if _, exists := routedUpstreams[upstream]; !exists {
			return fmt.Errorf("upstream %q has no route prefix", upstream)
		}
	}
	return nil
}

func newProxy(upstream *url.URL, prefix string) *httputil.ReverseProxy {
	return &httputil.ReverseProxy{
		Rewrite: func(proxyRequest *httputil.ProxyRequest) {
			request := proxyRequest.Out
			request.URL.Path = strings.TrimPrefix(proxyRequest.In.URL.Path, prefix)
			if request.URL.Path == "" {
				request.URL.Path = "/"
			}
			request.URL.RawPath = ""
			proxyRequest.SetURL(upstream)
			utility.StripIdentityHeaders(request.Header)
			utility.StripForwardingHeaders(request.Header)
			proxyRequest.SetXForwarded()
			request.Header.Set("X-Request-ID", utility.NewRequestID())
		},
	}
}
