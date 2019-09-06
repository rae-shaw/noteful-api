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

module.exports = notesRouter