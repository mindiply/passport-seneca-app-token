# Passport Seneca App Token strategy

Passport strategy that talks with a seneca microserver to validate app
tokens transmitted in the **SENECA-APP-TOKEN** custom header. 

The microserver project is [seneca-app-token-service][seneca-app-token-service].

Clients should acquire the app token from the authentication server and
pass it on to the microservice every time they need to access a protected
resource.

The strategy will verify the token with the microservice and authenticate 
the user.

There should be no support for authentication session persistance.


# Usage

To be shown 


# License

Apache 2.0

[seneca-app-token-service]: https://www.npmjs.com/package/@bongione/seneca-app-token-service