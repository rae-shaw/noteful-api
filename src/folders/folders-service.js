const FoldersService = {
	getAllFolders(knex){
		return knex.select('*').from('noteful_folders')
	},
	insertFolder(knex, newFolder) {
		console.log(newFolder)
		return knex
			.insert(newFolder)
			.into('noteful_folders')
			.returning('*')
			.then(rows => {
				return rows[0]
			})
	},
	getByIndex(knex, id){
		return knex
			.from('noteful_folders')
			.select('*')
			.where({ id })
			.first()
	},
	deleteFolder(knex, id){
		return knex('noteful_folders')
			.where({ id })
			.delete
	},
	updateFolder(knex, id, updatedFields){
		return knex('noteful_folders')
			.where({ id })
			.update(updatedFields)
	},

}

module.exports = FoldersService