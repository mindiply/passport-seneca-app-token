/**
 * Created by bongio on 26/10/2016.
 */

"use strict";

let chai=require('chai')
let expect=chai.expect
chai.use(require('chai-passport-strategy'))


const test_users = {
    'SAMPLE_TEST_TOKEN' : {
        result : 'ok',
        user : { name : 'Test user', email : 'test@example.com', _id : 'TEST_USER_ID'},
        scopes : ['TestA','TestB']
    },
    'SAMPLE_ERROR_TOKEN' : {
        result : 'error',
        details : 'Token not valid'
    },
    'SENECA_WRONG_MESSAGE' : {

    }
}

let mock_seneca = {
    act : (msg) => {
        return new Promise((resolve, reject) => {
            if (msg && msg.role === 'identity' && msg.action === 'verify_token' && msg.token && msg.token in test_users) {
                resolve(test_users[msg.token])
            } else {
                reject('Incorrect message')
            }
        })
    }
}


let mock_stream = {

}


describe('Check seneca passport app token strategy', function () {

    let SenecaAppTokenStrategy = require('../lib')
    let strategy = new SenecaAppTokenStrategy(mock_seneca)

    describe('Handling request with correct credentials', function() {
        let user, info
        before(function(done) {
            chai.passport.use(strategy)
                .success(function(u,i) {
                    user = u
                    info = i
                    done()
                })
                .req(function(req) {
                    req.get = (header) => {
                        return header === 'SENECA-APP-TOKEN' ? 'SAMPLE_TEST_TOKEN' : undefined
                    }
                    req._passport = true
                    req.on = () => {

                    }
                    req.removeListener = () => {

                    }
                    req.emit =  {
                        apply : () => {

                        }
                    }
                })
                .authenticate()
        })

        it('should supply test user', function() {
            expect(user).to.be.an.object
            expect(user).to.deep.equal(test_users['SAMPLE_TEST_TOKEN'].user)
        })

        it('should supply zones information', function() {
            expect(info).to.be.an.objecct
            expect(info.scopes).to.deep.equal(test_users['SAMPLE_TEST_TOKEN'].scopes)
        })
    })


    describe('Request shoud fail authentication normally because of invalid test token', function() {
        let fails = false

        before(function(done) {
            chai.passport.use(strategy)
                .fail(function () {
                    fails = true
                    done()
                })
                .req(function (req) {
                    req.get = (header) => {
                        return header === 'SENECA-APP-TOKEN' ? 'SAMPLE_ERROR_TOKEN' : undefined
                    }
                    req._passport = true
                    req.on = () => {

                    }
                    req.removeListener = () => {

                    }
                    req.emit = {
                        apply: () => {

                        }
                    }
                })
                .authenticate()
        })

        it('Authentication should fail', function () {
            expect(fails).to.equal(true)
        })
    })


    describe('Request shoud fail because token is not present', function() {
        let fails = false

        before(function(done) {
            chai.passport.use(strategy)
                .fail(function () {
                    fails = true
                    done()
                })
                .req(function (req) {
                    req.get = (header) => {
                        return undefined
                    }
                    req._passport = true
                    req.on = () => {

                    }
                    req.removeListener = () => {

                    }
                    req.emit = {
                        apply: () => {

                        }
                    }
                })
                .authenticate()
        })

        it('Authentication should fail', function () {
            expect(fails).to.equal(true)
        })
    })


    describe('Request shoud error because of incorrect return message from seneca', function() {
        let errors = false

        before(function(done) {
            chai.passport.use(strategy)
                .error(function () {
                    errors = true
                    done()
                })
                .req(function (req) {
                    req.get = (header) => {
                        return header === 'SENECA-APP-TOKEN' ? 'SENECA_WRONG_MESSAGE' : undefined
                    }
                    req._passport = true
                    req.on = () => {

                    }
                    req.removeListener = () => {

                    }
                    req.emit = {
                        apply: () => {

                        }
                    }
                })
                .authenticate()
        })

        it('Authentication should error', function () {
            expect(errors).to.equal(true)
        })
    })
})
