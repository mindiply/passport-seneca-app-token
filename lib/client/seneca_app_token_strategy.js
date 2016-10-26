/**
 * Created by pfbongio on 25/10/2016.
 */

'use strict'

let util = require('util')
let Strategy = require('passport-strategy')
let pause = require('pause')

/**
 *
 * Constructor for the Seneca app token strategy.
 *
 * @param seneca_client seneca instance with client configured to interact with the service providing the token feedback
 * @api public
 */
function SenecaAppTokenStrategy(seneca_client) {
    Strategy.call(this);
    this.name = 'seneca_app_token_strategy';
    this._seneca_client = seneca_client
}

util.inherits(SenecaAppTokenStrategy, Strategy);


/**
 * Authenticate request by communicating with seneca microservice using
 * the token saved in the request header.
 *
 * This strategy does not support use of session, every request ought
 * to verify the app token with the auth microservice.
 *
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
SenecaAppTokenStrategy.prototype.authenticate = function(req, options) {
    if (!req._passport) { return this.error(new Error('passport.initialize() middleware not in use')); }
    options = options || { seneca : {} };

    let self = this
    let paused=pause(req)

    try {
        // Extract the token information from the request header, fail if not there
        let token = req.get('SENECA-APP-TOKEN')
        if (!token || !this._seneca_client) {
            self.fail()
            paused.resume()
            return;
        }

        // Send token info to seneca for verification
        let msg = {
            role : 'identity',
            action : 'verify_token',
            token
        }
        this._seneca_client.act(msg)
            .then(auth_data => {
                if (auth_data && auth_data.result === 'ok' && auth_data.user && auth_data.scopes) {
                    self.success(auth_data.user, {scopes : auth_data.scopes})
                } else {
                    if (auth_data && auth_data.result === 'error' && auth_data.details) {
                        self.fail()
                    } else {
                        self.error('Unexpected message returned from token verification service')
                    }
                }
                paused.resume()
            })
            .catch(err => {
                self.error(err)
                paused.resume()
            })
    } catch (err) {
        console.log(err)
        self.error(err)
        paused.resume()
    }
}


/**
 * Expose `SenecaAppTokenStrategy`.
 */
module.exports = SenecaAppTokenStrategy
