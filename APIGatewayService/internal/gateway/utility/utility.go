package utility

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

func MatchesPrefix(path, prefix string) bool {
	return path == prefix || strings.HasPrefix(path, prefix+"/")
}

func StripIdentityHeaders(header http.Header) {
	for key := range header {
		if strings.HasPrefix(strings.ToLower(key), "x-user-") {
			header.Del(key)
		}
	}
}

func StripForwardingHeaders(header http.Header) {
	for _, key := range []string{"Forwarded", "X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Proto"} {
		header.Del(key)
	}
}

func NewRequestID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		panic("generate request correlation ID: " + err.Error())
	}
	return hex.EncodeToString(bytes)
}

func ParseURL(rawURL string) (*url.URL, error) {
	parsedURL, err := url.Parse(rawURL)
	if err != nil || parsedURL.Scheme == "" || parsedURL.Host == "" {
		return nil, fmt.Errorf("invalid upstream URL %q", rawURL)
	}
	return parsedURL, nil
}
