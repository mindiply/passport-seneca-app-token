/**
 * Created by pfbongio on 11/10/2016.
 */

'use strict'

let crypto = require('crypto')
let moment = require('moment')

const APP_TOKEN_EXPIRATION_SECONDS = 3600

function _token2UserScopeKey(token) {
    return token ? 'TOKEN_2_UID_SCOPE_'+token : null
}

/**
 * The module epxorts two functions, createAppToken, to create a cryptographically secure random token,
 * that expires by default after an hour, and a function userScopesByToken that retrieves the token
 * if it still exists.
 *
 * The options passed when initializing the module are:
 *
 *
 * @param options is a optional options object which understands:
 *  * redis_client a redis client to be used instead of the default one
 *  * log a bunyan style log object instead of the standard one
 *  * expiration_seconds to change the default expiry of the application token
 *
 * @returns {{createAppToken: (function(*=, *)), userScopesByToken: (function(*=))}}
 */

module.exports = (options = {}) => {
    let redis_client = options.redis_client || require('../redis/redis_client')()
    let log = options.log || require('../conf/logging')
    let expiration_seconds = options.expiration_seconds || APP_TOKEN_EXPIRATION_SECONDS

    return {

        createAppToken: (user_id, scopes) => {

            let p = new Promise((resolve, reject) => {
                    try {
                        let token = crypto.randomBytes(256).toString('base64')
                        let token_key = _token2UserScopeKey(token)
                        if (!token_key) throw new Error('Incorrect token key')

                        let expiration_date = moment.utc().add(expiration_seconds, 's').toDate()
                        let token_data = {
                            token,
                            expiration: expiration_date
                        }
                        resolve(Promise.all([
                                redis_client.lpush(token_key, user_id, ...scopes),
                                redis_client.expire(token_key, expiration_seconds)
                            ]).then(results => {
                                return token_data
                            })
                        )
                    } catch (err) {
                        log.error(err, 'Unable to create application token')
                        reject('Unable to create application tokent')
                    }
                })
            return p
        },


        userScopesByToken: (token) => {
            let p = new Promise((resolve, reject) => {
                try {
                    let token_key = _token2UserScopeKey(token)
                    if (!token_key) {
                        reject('Incorrect token')
                        return
                    }
                    let q = redis_client.lrange(token_key, 0, -1)
                        .then(values => {
                            if (!values || values.length < 2) throw new Error('Incorrect values returned')
                            return {
                                user_id: values[0],
                                scopes: values.slice(1)
                            }
                        })
                    resolve(q)
                } catch (err) {
                    log.error(err, 'Error while validating the provided token')
                    reject('Error while validating the provided token')
                }
            })
            return p
        }
    }

}
