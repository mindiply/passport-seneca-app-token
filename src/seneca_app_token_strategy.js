/**
 * Created by pfbongio on 25/10/2016.
 */

'use strict'

let util = require('util')
let Strategy = require('passport-strategy')
let pause = require('pause')
let promisify = require('es6-promisify')

/**
 *
 * Constructor for the Seneca app token strategy.
 *
 * @param senecaClient seneca instance with client configured to interact with the service providing the token feedback
 * @api public
 */
function SenecaAppTokenStrategy (senecaClient) {
    Strategy.call(this)
    this.name = 'seneca_app_token_strategy'
    this._senecaClient = Object.assign({}, senecaClient)

    if (!this._senecaClient.microServiceSend) {
        let senecaAct = promisify(this._senecaClient.act, this._senecaClient)
        this._senecaClient.microServiceSend = (cmd) => {
            return senecaAct(cmd)
        }
    }
}
util.inherits(SenecaAppTokenStrategy, Strategy)

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
SenecaAppTokenStrategy.prototype.authenticate = function (req, options) {
    if (!req._passport) { return this.error(new Error('passport.initialize() middleware not in use')) }
    options = options || { seneca: {} }

    let self = this
    let paused = pause(req)

    try {
        // Extract the token information from the request header, fail if not there
        let token = req.get('SENECA-APP-TOKEN')
        if (!token || !this._senecaClient) {
            self.fail()
            paused.resume()
            return
        }

        // Send token info to seneca for verification
        let msg = {
            role: 'identity',
            action: 'verify_token',
            token
        }
        this._senecaClient.microServiceSend(msg)
            .then(authData => {
                if (authData && authData.result === 'ok' && authData.user && authData.scopes) {
                    self.success(authData.user, {scopes: authData.scopes})
                } else {
                    if (authData && authData.result === 'error' && authData.details) {
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
