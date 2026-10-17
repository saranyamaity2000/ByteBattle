# ByteBattle

ByteBattle is a competitive programming platform that routes browser traffic to its internal services.

## Language

**API Gateway**:
The sole public reverse proxy for ByteBattle browser, REST, and socket traffic. It authenticates requests and supplies trusted identity context to internal services.
_Avoid_: Auth service, proxy

**User Identity**:
The authenticated principal context supplied by the API Gateway to an internal service.
_Avoid_: User information, auth data

**User ID**:
An immutable identifier owned by ByteBattle's authentication system for a User Identity.
_Avoid_: Email, Google ID

**User Account**:
The gateway-owned record that associates a User ID with authentication methods, such as a verified password or explicitly linked Google identity.
_Avoid_: Google account, login

**Authentication Method**:
A verified mechanism through which a User Account can establish a User Identity.
_Avoid_: Provider, credential
