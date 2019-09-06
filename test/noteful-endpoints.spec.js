const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
//const fixtures = require('./noteful.fixtures')

describe('noteful Endpoints', function() {
	let db 

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DB_URL
		})
		app.set('db', db)
	})

	//before('clean the table', () => db('noteful').truncate())

	//afterEach('cleanup', () => db('noteful').truncate())

	after('disconnect from db', () => db.destroy())

	describe('GET /api/notes', () => {
		console.log('process.env', process.env)
		context('Given no notes', () => {
			it('responds with 200 and an empty list', () => {
				return supertest(app)
					.get('api/notes')
					//.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
					.expect(200, [])
			})
		})
	})
})