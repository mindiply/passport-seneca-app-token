# Passport Seneca App Token

The package provides utility functions to create a microservice that
handles authentication and provides the creation of app tokens for other
microservices.

Clients of the microservice then use a passport strategy which doesn't
use session but that communicates with the service to verify the validity
of the application token.

It's mean to be a lighter way verification mechanism than a full OAuth
implementation.

# Usage

## MicroServer side

The key function provided for the microservice is **createAppToken(user_id, scopes)**,
where user_id is a string serialization of the user_id unique identifier,
and scopes is an array of scopes.

The microservice server will need to expose via express or other
framework the generated tokens. Tokens will by default expire after 60 
minutes.

The microserver also provides a seneca service that will provide the 
service {role : 'identity', action : 'verify_token'} that expects the field 
*token* as payload.

The service is used on the client side to serialize/deserialize users.

Users need to configure the plugin by providing a app_tokens.js
 



# License

Apache 2.0