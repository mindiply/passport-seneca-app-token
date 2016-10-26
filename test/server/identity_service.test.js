/**
 * Created by pfbongio on 25/10/2016.
 */

"use strict";

let chai=require('chai')
let expect=chai.expect

const test_user = {
    user_id : 'TESTID',
    name : 'Test Name',
    email : 'test@example.com'
}

const test_token_data = {
    token : 'TEST_TOKEN',
    user_id : test_user.user_id,
    scopes : ['Test1', 'Test2']
}

const test_token_no_user = {
    token : 'TEST_TOKEN_NO_USER',
    user_id : 'NO_VALID_USER_ID',
    scopes : ['Test1', 'Test2']
}

function testDeserializeUser(user_id) {
    return new Promise((resolve, reject) => {
        let result = user_id === test_user.user_id ? test_user : null
        resolve(result)
    })
}


function testUserScopeByToken(token) {
    return new Promise((resolve, reject) => {
        let result = token===test_token_data.token ? test_token_data : (token===test_token_no_user.token ? test_token_no_user : null)
        resolve(result)
    })
}


describe('Seneca verification token service', function () {

    let seneca = require('seneca')()
    let {senecaIdentityService} = require('../../lib/server')
    seneca.use(senecaIdentityService, { deserializeUser : testDeserializeUser,  app_tokens : {userScopeByToken : testUserScopeByToken}})

    it('Look for and return test user', function(done) {
        let msg = { role : 'identity', action : 'verify_token', token : test_token_data.token}
        return seneca.act(msg, function (err, res) {
            if (err) return done(err)
            try {
                expect(res.result).to.equal('ok')
                expect(res.user).to.deep.equal(test_user)
                expect(res.scopes).to.deep.equal(test_token_data.scopes)
            } catch (err) {
                done(err)
                return
            }
            done()
        })
    })

    it('Should return error, invalid token', function(done) {
        let msg = { role : 'identity', action : 'verify_token', token : 'INVALID_TOKEN'}
        return seneca.act(msg, function (err, res) {
            if (err) return done(err)
            try {
                expect(res.result).to.equal('error')
                expect(res.details).to.be.a('string')
            } catch (err) {
                done(err)
                return
            }
            done()
        })
    })


    it('Should return error, user not found', function(done) {
        let msg = { role : 'identity', action : 'verify_token', token : test_token_no_user.token}
        return seneca.act(msg, function (err, res) {
            if (err) return done(err)
            try {
                expect(res.result).to.equal('error')
                expect(res.details).to.be.a('string')
            } catch (err) {
                done(err)
                return
            }
            done()
        })
    })

})


