const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const fixtures = require('./notes.fixtures')

describe('noteful Endpoints', function() {
	let db 

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DB_URL
		})
		app.set('db', db)
		db.debug()
	})

	before('clean the table', () => { db.raw("truncate table noteful_folders cascade").catch(function(error) { console.error(error); }) })

	afterEach('cleanup', () => { db.raw("truncate table noteful_folders cascade").catch(function(error) { console.error(error); }) })


	after('disconnect from db', () => db.destroy())

	describe.only('GET /api/folders/', () => {
		// context('Given no folders', () => {
		// 	it('responds with 200 and an empty list', () => {
		// 		return supertest(app)
		// 			.get('/api/folders')
		// 			.expect(200, []).catch(function(error) { console.error(error); }) 
		// 	})
		// })
		context('Given there are folders in the database', () => {
			const testFolders = fixtures.makeFoldersArray()

			beforeEach('insert folders', () => {
				db.insert(testFolders).into('noteful_folders').returning('id').catch(function(error) { console.error(error); })
			})


			it('GET /api/folders responds with 200 and all of the notes', () =>{
				return supertest(app)
					.get('/api/folders/')
					.expect(200, testFolders)
			})
				
		})
	})

	describe('GET /api/notes/', () => {
		context('Given no notes', () => {
			it('responds with 200 and an empty list', () => {
				return supertest(app)
					.get('/api/notes/')
					.expect(200, [])
			})
		})
		context('Given there are notes in the database', () => {
			const testNotes = fixtures.makeNotesArray()
			const testFolders = fixtures.makeFoldersArray()

			beforeEach('insert folders', async function() {
				await db.insert(testFolders).into('noteful_folders').returning('id')
				await db.insert(testNotes).into('noteful_notes').returning('id')

			})


			it('GET /api/notes/ responds with 200 and all of the notes', () =>{
				return supertest(app)
					.get('/api/notes/')
					.expect(200, testNotes)
			})
				
		})

		context(`Given an XSS attack note`, () => {
			const { maliciousNote, expectedNote } = fixtures.makeMaliciousNote()
			const testFolders = fixtures.makeFoldersArray()

			beforeEach('insert malicious note', async function() {
				await db.insert(testFolders).into('noteful_folders')
				await db.into('noteful_notes').insert(maliciousNote)
			})
			it('removes XSS attack content', () => {
				return supertest(app)
					.get(`/api/notes`)
					.expect(200)
					.expect(res => {
						expect(res.body[0].name).to.eql(expectedNote.name)
						expect(res.body[0].content).to.eql(expectedNote.content)
					})
			})
		})
	})
	describe('GET /api/notes/:id/', () => {
		context(`Given no notes`, () => {
			it(`responds 404 when the note doesn't exist`, () => {
				return supertest(app)
					.get(`/api/notes/123`)
					.expect(404, {
						error: { message: `Note Not Found` }
					})
			})
		})
		context(`Given there are notes in the database`, () => {
			const testNotes = fixtures.makeNotesArray()
			const testFolders = fixtures.makeFoldersArray()

			beforeEach('insert folders', async function() {
				await db.insert(testFolders).into('noteful_folders').returning('id')
				await db.insert(testNotes).into('noteful_notes').returning('id')

			})
			it('GET /api/notes/id responds with 200 and the specified note', () => {
				const noteId = 2
				const expectedNote = testNotes[noteId-1]
				return supertest(app)
					.get(`/api/notes/${noteId}`)
					.expect(200, expectedNote)
			})
		})
		context(`Given an XSS attack note`, () => {
			const { maliciousNote, expectedNote } = fixtures.makeMaliciousNote()
			const testFolders = fixtures.makeFoldersArray()

			beforeEach('insert malicious note', async function() {
				await db.insert(testFolders).into('noteful_folders')
				await db.into('noteful_notes').insert(maliciousNote)
			})
			it('removes XSS attack content', () => {
				return supertest(app)
					.get(`/api/notes/${maliciousNote.id}`)
					.expect(200)
					.expect(res => {
						expect(res.body.name).to.eql(expectedNote.name)
						expect(res.body.content).to.eql(expectedNote.content)
					})
			})
		})
	})
	describe('DELETE /api/notes/:id/', () => {
		context(`Given no notes`, () => {
			it(`responds 404 when the bookmark doesn't exist`, () => {
				return supertest(app)
				.delete(`/api/notes/123`)
				.expect(404, {
					error: { message: `Note Not Found` }
				})
			})
		})
		context('Given there are notes in the database', () => {
			const testNotes = fixtures.makeNotesArray()
			const testFolders = fixtures.makeFoldersArray()

			beforeEach('insert folders', async function() {
				await db.insert(testFolders).into('noteful_folders').returning('id')
				await db.insert(testNotes).into('noteful_notes').returning('id')

			})
			it('removes the note by ID', () => {
				const idToRemove = 2
				const expectedNotes = testNotes.filter(nt => nt.id !== idToRemove)
					return supertest(app)
					.delete(`/api/notes/${idToRemove}`)
					.expect(204)
					.then(() =>
						supertest(app)
							.get(`/api/notes`)
							.expect(expectedNotes))
			})
		})
	})
	describe(`PATCH /api/notes/:id/`, () => {
		context(`Given no notes`, () =>{
			it(`responds with 404`, () => {
				const noteId = 123
				return supertest(app)
					.patch(`/api/notes/${noteId}`)
					.expect(404, {
						error: { message: `Note Not Found`}
					})
			})
		})
		context(`Given there are bookmarks in the database`, () => {
			const testNotes = fixtures.makeNotesArray()
			const testFolders = fixtures.makeFoldersArray()

			beforeEach('insert folders', async function() {
				await db.insert(testFolders).into('noteful_folders').returning('id')
				await db.insert(testNotes).into('noteful_notes').returning('id')

			})

			it('responds with 204 and updates the bookmark', () => {
				const idToUpdate = 2
				const updateNote = {
					name: 'updated note name',
					content: 'updated content',
				}
				const expectedNote = {
					...testNotes[idToUpdate - 1],
					...updateNote
				}
				return supertest(app)
				.patch(`/api/notes/${idToUpdate}`)
				.send(updateNote)
				.expect(204)
				then( res =>
					supertest(app)
						.get(`/api/notes/${idToUpdate}`)
						.expect(expectedNote)
					)
			})
			it(`responds with 400 when no required fields supplied`, () => {
				const idToUpdate = 2
				const updateNote = {
					name: 'updated note name',
				}
				const expectedNote = {
					...testNotes[idToUpdate - 1],
					...updateNote
				}

				return supertest(app)
				.patch(`/api/notes/${idToUpdate}`)
				.send({
					irrelevantField: 'foo'
				})
				.expect(400, {
					error: {
						message: `Request body must contain either 'name' or 'content'`
					}
				})
			})

			it(`responds with 204 when updating only a subset of fields`, () => {
				const idToUpdate = 2
				const updateNote ={
					name: 'updated note name',
				}
				const expectedNote = {
					...testNotes[idToUpdate -1],
					...updateNote
				}

				return supertest(app)
					.patch(`/api/notes/${idToUpdate}`)
					.send({
						...updateNote,
						fieldToIgnore: 'should not be in GET response'
					})
					.expect(204)
					.then( res =>
						supertest(app)
							.get(`/api/notes/${idToUpdate}`)
							.expect(expectedNote)
						)
			})
		})
	})

	describe(`POST /api/notes`, () => {
		const testFolders = fixtures.makeFoldersArray()
		beforeEach('insert folders', async function() {
				await db.insert(testFolders).into('noteful_folders').returning('id')
		})
		it(`responds with 400 missing 'name' if not supplied`, () => {
			const newNoteMissingName = {
				//name: 'new name',
				folder_id: 2,
			}
			return supertest(app)
				.post(`/api/notes`)
				.send(newNoteMissingName)
				.expect(400, {
					error: { message: `Missing 'name' in request body`}
				})
		})
		it(`responds with 400 missing 'folder_id' if not supplied`, () => {
			const newNoteMissingName = {
				name: 'new name',
				//folder_id: 2,
			}
			return supertest(app)
				.post(`/api/notes`)
				.send(newNoteMissingName)
				.expect(400, {
					error: { message: `Missing 'folder_id' in request body`}
				})
		})

		it('creates a note, responding with a 201 and the new note', () => {
			const newNote ={
				name: 'new note name',
				folder_id: 2,
				content: 'new note content'
			}
			return supertest(app)
				.post('/api/notes')
				.send(newNote)
				.expect(201)
				.expect( res => {
					expect(res.body.name).to.eql(newNote.name)
					expect(res.body.content).to.eql(newNote.content)
					expect(res.body.folder_id).to.eql(newNote.folder_id)
					expect(res.body).to.have.property('id')
					expect(res.body).to.have.property('modified')
				})
				.then(res =>
					supertest(app)
					.get(`/api/notes/${res.body.id}`)
					.expect(res.body)
				)
		})
	})
})








