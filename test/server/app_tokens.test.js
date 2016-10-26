/**
 * Created by pfbongio on 20/10/2016.
 */

let chai=require('chai')
let expect=chai.expect

let moment = require('moment')


function createMockRedisClient() {
    let data = {}
    let client = {
        lpush : (key, ...values) => {
            let p = new Promise((resolve, reject) => {
                data[key] = {values : [...values]}
                setTimeout(() => {resolve(true)}, 50)
            })
            return p
        },
        expire : (key, expiration) => {
            let p = new Promise((resolve, reject) => {
                data[key] = Object.assign({}, data[key], {expiration})
                setTimeout(() => {resolve(true)}, 50)
            })
            return p
        },
        lrange: (key, start, end) => {
            let p = new Promise((resolve, reject) => {
                setTimeout(() => {resolve(data[key].values)}, 50)
            })
            return p
        }
    }
    return client
}
let redis_client = createMockRedisClient()



let log = {
    warn : () => {

    },
    info : () => {

    },
    error : console.log,
    debug : () => {

    }
}

const TOKEN_EXPIRATION_SECONDS = 60

describe('Application token generation', function () {

    let {createAppToken, userScopesByToken} = require('../../lib/server').appTokens({redis_client, log, expiration_seconds : TOKEN_EXPIRATION_SECONDS})

    it('Generate and retrieve a token for test zone', function() {

        let created_token_data = {}
        let expires_after = moment.utc().add(TOKEN_EXPIRATION_SECONDS,'s').toDate()
        let expires_before = moment.utc().add(TOKEN_EXPIRATION_SECONDS*2,'s').toDate()
        let expected_user_zones_data = {user_id : 'TEST_ID', scopes : ['Test1', 'Test2']}


        return createAppToken(expected_user_zones_data.user_id, expected_user_zones_data.scopes)
            .then(token_data => {
                expect(Object.keys(token_data)).to.have.length(2)
                expect(token_data.token).to.be.a('string')
                expect(token_data.expiration).to.be.a('date')
                expect(token_data.expiration.valueOf()).to.be.above(expires_after.valueOf())
                expect(token_data.expiration.valueOf()).to.be.below(expires_before.valueOf())
                Object.assign(created_token_data, token_data)
                return userScopesByToken(token_data.token)
            })
            .then(retrieved_token_data => {

                expect(retrieved_token_data).to.deep.equal(expected_user_zones_data)
            })
    })
})
