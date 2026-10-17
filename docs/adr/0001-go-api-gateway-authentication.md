# Use a Go API Gateway for authentication

ByteBattle will replace Supabase completely with an `APIGatewayService` written in Go. The gateway is the only public reverse proxy for browser REST and Socket.IO traffic: it authenticates users, removes caller-supplied identity headers, and injects `X-User-ID`, `X-User-Email`, and `X-Request-ID` for private internal services. Domain services continue to authorize actions themselves.

The gateway owns MongoDB user accounts, Google OAuth, verified email/password enrollment, explicit authentication-method linking, and Resend-backed verification and recovery email. It issues 5-minute Ed25519 access JWTs, held only in browser memory, and rotating HttpOnly refresh cookies with 7-day idle and 30-day absolute lifetimes. Internal services must be reachable only through the gateway in local and production deployments. Mutual TLS remains deferred hardening; general gateway rate limiting is future work, while targeted authentication abuse controls are included now.

## Consequences

This is a hard cutover: users re-enroll or sign in, and every Supabase package, configuration value, secret, mock, CI/local reference, and document is removed. The frontend and gateway use same-site HTTPS subdomains in production; cookie-authenticated refresh/logout and socket handshakes validate approved origins and apply CSRF protection.
