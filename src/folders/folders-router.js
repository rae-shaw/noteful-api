const path = require('path')
const express = require('express')
//const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()
const serializeFolder = folder => ({
	id: folder.id,
	name: folder.name,
})

foldersRouter
	.route('/')
	.get((req, res, next) => {
		const knexInstance = req.app.get('db')
		FoldersService.getAllFolders(knexInstance)
			.then(folders => {
				res.json(folders.map(serializeFolder))
			})
		.catch(next)
	})
	.post(jsonParser, (req, res, next) => {
		const name = req.body
		for(const [key, value] of Object.entries(name)){
			if (value == null) {
				return res.status(400).json({
					error: { message: `Missing '${key} in request body`}
				})
			}
		}
		FoldersService.insertFolder(
			req.app.get('db'),
			req.body
		)
			.then(folder => {
				res
					.status(201)
					.json(folder)
			})
			.catch(next)
	})
	

foldersRouter
	.route('/:folder_id')
	.all((req, res, next) => {
		console.log('request ', req.params.id)
		FoldersService.getById(req.app.get('db'), req.params.id)
			.then(folder => {
				if(!folder) {
					logger.error(`Folder with id ${req.params.id} not found.`)
					return res.status(404).json({
						error: { message: `Folder Not Found`}
					})
				}
				res.folder = folder
				next()
			})
			.catch( error => console.log('caught error ' , error))
		})

	.get((req, res, next) => {
		res.json(serializeFolder(res.folder))
		.catch(next)

	})
	.delete((req, res, next) => {
		FoldersService.deleteFolder(
			req.app.get('db'),
			req.params.id
		)
			.then(numRowsAffected => {
				res.status(204).end()
			})
			.catch(next)
	})

	.patch(jsonParser, (req, res, next) =>{
		const { name } = req.body

		const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
			if (numberOfValues === 0) {
				return res.status(400).json({
					error: { message: `Request body must contain 'name'`}
				})
			}
		FoldersService.updateFolder(
			req.app.get('db'),
			req.params.id,
			FolderToUpdate
			)
				.then(numRowsAffected => {
					res.status(204).end()
				})
				.catch(next)
	})

module.exports = foldersRouter