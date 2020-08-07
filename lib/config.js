import { existsFile, readFile } from './util/file'

const filePath = './config.json'

if (!existsFile(filePath))
	throw new Error('configファイルが存在しません', filePath)

const config = JSON.parse(readFile(filePath))

export default config;