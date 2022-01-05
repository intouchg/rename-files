#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const CONFIG_FILENAME = '.rename.js'

const configFilepath = path.resolve(process.cwd(), CONFIG_FILENAME)

if (!fs.existsSync(configFilepath)) {
	console.error('No .rename.js file was found at filepath:')
	console.error(configFilepath)
	process.exit(1)
}

const config = require(configFilepath)
let context = process.cwd()

if (config.context) {
	context = path.isAbsolute(config.context) ? config.context : path.resolve(context, config.context)
}

// Finds the first index of a glob magic character in the 
// filepath, or the last index if reversed.
const getMagicCharIndex = (filepath, reverse) => {
	let chars = filepath.split('')
	if (reverse) chars = chars.reverse()

	let index = chars.findIndex((char) =>
		char === '*'
		|| char === '?'
		|| char === '['
		|| char === '{'
		|| char === '!'
		|| char === '+'
		|| char === '@'
	)

	return reverse ? chars.length - 1 - index : index
}

config.patterns.forEach(({ from, to, delete: del }) => {
	if (!del && !(from && to)) {
		console.error('Each rename-files object must contain either a "from" and "to" path or a "delete" path')
		process.exit(1)
	}
	
	const source = path.join(context, del || from)
	const output = typeof to === 'string' ? () => path.join(context, to) : to

	const files = glob.sync(
		source,
		{
			cwd: context,
			matchBase: true,
		}
	)

	files.forEach((filepath) => {
		if (del) return fs.rmSync(filepath, { recursive: true })
		let newFilepath = output(filepath)
		if (!path.isAbsolute(newFilepath)) newFilepath = path.join(context, newFilepath)
		if (typeof newFilepath !== 'string') return
		if (glob.hasMagic(source) && newFilepath.includes('*')) {
			const firstMagicIndex = getMagicCharIndex(source)
			const lastMagicIndex = getMagicCharIndex(source, true)
			const afterMagicLength = source.length - 1 - lastMagicIndex
			const magicMatch = filepath.slice(firstMagicIndex, -afterMagicLength)
			newFilepath = newFilepath.replace('*', magicMatch)
		}
		fs.mkdirSync(
			newFilepath.replace(path.basename(newFilepath), ''),
			{ recursive: true }
		)
		fs.renameSync(filepath, newFilepath)
	})
})

if (config.cleanEmptyDirs !== false) {
	const directories = glob.sync(
		'**/',
		{
			cwd: context,
			matchBase: true,
		}
	)

	directories.reverse().forEach((partialFilepath) => {
		const filepath = path.join(context, partialFilepath)
		const files = fs.readdirSync(filepath)
		if (files.length === 0) fs.rmdirSync(filepath)
	})
}