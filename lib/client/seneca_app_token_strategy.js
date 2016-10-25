/**
 * Created by pfbongio on 25/10/2016.
 */

'use strict'

let util = require('util')
let Strategy = require('passport-strategy')
let pause = require('pause')

function SenecaAppTokenStrategy() {
    Strategy.call(this);
    this.name = 'seneca_app_token_strategy';
}

util.inherits(SessionStrategy, Strategy);


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

    } catch (err) {
        self.error(err)
        paused.resume()
    }

    // Extract the token information from the request header, fail if not there

    // Send token info to seneca for verification

    // Once we get the data back decide determine if success, fail or error

    if (su || su === 0) {
        // NOTE: Stream pausing is desirable in the case where later middleware is
        //       listening for events emitted from request.  For discussion on the
        //       matter, refer to: https://github.com/jaredhanson/passport/pull/106

        var paused = options.pauseStream ? pause(req) : null;
        req._passport.instance.deserializeUser(su, req, function(err, user) {
            if (err) { return self.error(err); }
            if (!user) {
                delete req._passport.session.user;
                self.pass();
                if (paused) {
                    paused.resume();
                }
                return;
            }
            var property = req._passport.instance._userProperty || 'user';
            req[property] = user;
            self.pass();
            if (paused) {
                paused.resume();
            }
        });
    } else {
        self.pass();
    }
};


/**
 * Expose `SenecaAppTokenStrategy`.
 */
module.exports = SenecaAppTokenStrategy;
