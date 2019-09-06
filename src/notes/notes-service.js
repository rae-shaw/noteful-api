const NotesService = {
	getAllNotes(knex) {
		return knex.select('*').from('noteful_notes')
	},
	insertNote(knex, newNote){
		return knex
			.insert(newNote)
			.into('noteful')
			.returning('*')
			.then(rows => {
				return rows[0]
			})
	},
	getByIndex(knex, id){
		return knex
			.from('noteful')
			.select('*')
			.where(id, 'id')
			.first()
	},
	deleteNote(knex, id){
		return knex('noteful')
			.where({ id })
			.delete
	},
	updateNote(knex, id, updatedFields){
		return knex('noteful')
			.where({ id })
			.update(updatedFields)
	},
}

module.exports = NotesService