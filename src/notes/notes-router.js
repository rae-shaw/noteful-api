const path = require('path')
const express = require('express')
const logger = require('../logger')
//const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()
const serializeNote = note => ({
	id: note.id,
	name: note.name,
	modified: note.modified,
	folderId: note.folder_id,
	content: note.content,
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
	//.post(req, res, next)
	//post code here

//	.route('/:note_id')
//	.all((req, res, next) => {
		//find note by id
//	})

//	.get
		//get note
//	.delete
		//delete note
//		//update note

// notesRouter
// 	.route('/:id')
// 	.all((req, res, next) =>{
// 		const knexInstance = req.app.get('db')
// 		NotesService.getById(knexInstance, req.params.id)
// 			.then(note => {
// 				if(!note) {
// 					logger.error(`Note with id ${req.params.id} not found`)
// 					return res.status(404).json({
// 						error: { message: `Bookmark Not Found` }
// 					})
// 				}
// 				res.note = note
// 				next()
// 			})
// 		.catch(next)
// 	})
// 	.get((req, res) => {
// 		res.json(serializeNote(res.note))
// 	})











module.exports = notesRouter