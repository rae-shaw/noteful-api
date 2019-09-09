function makeNotesArray(){
	return [
		{
			"id": 1,
			"name": "First test post",
			"modified": "2019-09-07T01:14:57.237Z",
			"folder_id": 2,
			"content": "So much test post"	
		},
		{
			"id": 2,
			"name": 'Second test post',
			"modified": "2019-09-07T01:14:57.237Z",
			"folder_id": 3,
			"content": "So much more test post"
		},
		{
			"id": 3,
			"name": "Third test post",
			"modified": "2019-09-07T01:14:57.237Z",
			"folder_id": 1,
			"content": "Even more test post"
		},
	];
}

function makeFoldersArray(){
	return [
		{
			id: 1,
			name: 'test 1'
		},
		{
			id: 2,
			name: 'test 2'
		},
		{
			id: 3,
			name: 'test 3'
		},
	];
}

function makeMaliciousNote() {
	const maliciousNote = {
		id: 4,
		name:'Naughty note <script>alert("xss");</script>',
		modified: "2019-09-07T01:14:57.237Z",
		folder_id: 1,
		content: `bad image < img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
	}
	const expectedNote = {
		...maliciousNote,
		name: 'Naughty note &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
		content: `bad image &lt; img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt;. But not <strong>all</strong> bad.`
	}
	return{
		maliciousNote,
		expectedNote,
	}
}
module.exports = {
	makeNotesArray,
	makeFoldersArray,
	makeMaliciousNote,
}