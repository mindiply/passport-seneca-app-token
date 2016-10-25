/**
 * Created by pfbongio on 11/10/2016.
 */
"use strict";

module.exports = function (options = {}) {

    this.log.info('Adding auth seneca services')
    let {deserializeUser} = options
    let {userScopeByToken} = options.app_tokens || require('./app_tokens')

    this.add({
        role : 'identity',
        action : 'verify_token'
    }, (msg, respond) => {
        let { token } = msg
        let response = {}
        userScopeByToken(token)
            .then(token_data => {
                if (!token_data || ! token_data.scopes || !token_data.user_id) throw new Error('No valid token data found')
                response.scopes = token_data.scopes
                return deserializeUser(token_data.user_id)
            })
            .then(user => {
                if (!user) throw new Error ('User not found')
                Object.assign(response, {
                    result : 'ok',
                    user: user
                })
                respond(null, response)
            })
            .catch(err =>{
                this.log.warn('Unable to authenticate a app token: '+err)
                respond(null, {
                    result : 'error',
                    details : String(err)
                })
            })
    })


}
