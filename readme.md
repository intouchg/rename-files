# @intouchg/rename-files

Simple Node CLI to rename, move, and delete files using a config file

## Getting Started

1. Install dependencies
```sh
yarn add --dev @intouchg/rename-files
```

2. Setup a `.rename.js` config file

3. Run the CLI, perhaps as part of an npm script after a build
```sh
rename-files
```

## Configuration

Create a `.rename.js` config file in the project root.

```js
// .rename.js
module.exports = {
	context: 'dist',
	patterns: [
		{
			from: '404.html',
			to: 'page-not-found.html',
		},
		{
			from: '/images/icons/*.png',
			to: '/images/*-icon.png',
		},
		{
			delete: '/data/**/*.json'
		},
		{
			from: '/images/**/',
			to: (filepath) => {
				const files = fs.readdirSync(filepath)
				if (files.length > 100) return '/images/100/*'
				return filepath
			}
		},
	],
}
```

### Options

**`context`** - Optional. This is the base filepath that all `patterns` paths will be resolved against. The `context` path may be absolute or relative to the process.cwd(). Defaults to process.cwd().

**`cleanEmptyDirs`** - Optional. This boolean controls if the CLI deletes all empty directories under the `context` path once all file renaming and deleting has been completed. Defaults to true.

### Patterns

**`patterns`** - Required. This array contains all `pattern` objects which control renaming and deleting files.

To delete a file, create a pattern object with a `delete` path, relative to the `context`. The `delete` filepath supports full glob pattern matching.

To rename or move a file, create a pattern object with `from` and `to` paths, relative to the `context`.

The `from` filepath supports full glob pattern matching.

The `to` filepath supports a single wildcard character `*` which will be replaced by everything that was *magically matched* by glob. This is suitable for simple glob-based replacements:

```js
module.exports = {
	patterns: [
		{
			from: '/texts/**/*.txt',
			to: '/user/documents/*.rtf',
		}
	]
}
```

For more complex replacements, the `to` property can also be a function that receives the matched filepath from glob. You can return a string from the `to` function and the CLI will treat it like any other pattern object - or you can take whatever operations you want on the provided filepath and return void:

```js
module.exports = {
	patterns: [
		{
			from: '/**/*.js',
			to: (filepath) => {
				console.log(filepath)
				return '/scripts/*.jsx'
			}
		},
		{
			from: '/**/',
			to: (filepath) => {
				const files = fs.readDirSync(filepath)
				console.log(files.length)
			}
		},
	]
}
```
