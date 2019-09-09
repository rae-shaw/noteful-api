const path = require('path')
const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()
const serializeNote = note => ({
	id: note.id,
	name: xss(note.name),
	modified: note.modified,
	folder_id: note.folder_id,
	content: xss(note.content),
})

notesRouter
	.route('/')
	.get((req, res, next) => {
		const knexInstance = req.app.get('db')
		NotesService.getAllNotes(knexInstance)
			.then(notes => {
				res.json(notes.map(serializeNote))
			})
		.catch(next)
	})
	.post(jsonParser, (req, res, next) => {
		const { name, modified, folder_id, content } = req.body
		const newNote = { name, folder_id }

		for(const [key,value] of Object.entries(newNote)) {
			if (value == null) {
				return res.status(400).json({
					error: { message: `Missing '${key}' in request body`}
				})
			}
		}
		
		NotesService.insertNote(
			req.app.get('db'),
			req.body
		)
			.then(note =>{
				res
					.status(201)
					.json(note)
			})
			.catch(next)
	})
notesRouter
	.route('/:id')
	.all((req, res, next) => {
		console.log('request ', req.params.id)
		NotesService.getById(req.app.get('db'), req.params.id)
			.then(note => {
				if(!note) {
					logger.error(`Note with id ${req.params.id} not found.`)
					return res.status(404).json({
						error: { message: `Note Not Found`}
					})
				}
				res.note = note
				next()
			})
			.catch( error => console.log('caught error ' , error))
		})

	.get((req, res, next) => {
		res.json(serializeNote(res.note))
		.catch(next)

	})

	.delete((req, res, next) => {
		NotesService.deleteNote(
			req.app.get('db'),
			req.params.id
		)
			.then(numRowsAffected => {
				res.status(204).end()
			})
			.catch(next)
	})

	.patch(jsonParser, (req, res, next) =>{
		const { name, content } = req.body
		const noteToUpdate = { name, content }

		const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
			if (numberOfValues === 0) {
				return res.status(400).json({
					error: { message: `Request body must contain either 'name' or 'content'`}
				})
			}
		NotesService.updateNote(
			req.app.get('db'),
			req.params.id,
			noteToUpdate
			)
				.then(numRowsAffected => {
					res.status(204).end()
				})
				.catch(next)
	})

module.exports = notesRouter






