const path = require('path')
const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

foldersRouter
	.route('/')
	.get(req, res, next)
	//get all code here
	.post(req, res, next)
	//post code here

foldersRouter
	.route('/:folder_id')
	.all((req, res, next) => {
		//find folder by id
	})

	.get
		//get folder
	.delete
		//delete folder
	.patch
		//update folder

module.exports = foldersRouter