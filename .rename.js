module.exports = {
	context: 'test/',
	patterns: [
		{
			from: 'file1.txt',
			to: 'file2.txt'
		},
		{
			delete: 'test.txt'
		},
		{
			from: 'data/**/*.txt',
			to: 'goofy/*.js'
		},
		{
			from: 'data/**/*.js',
			to: (filepath) => {
				console.log('test!', filepath)
				return 'goofy/*.txt'
			},
		}
	]
}