import { execCmd } from './util/process'
import {
	existsFile, 
	readDir
} from './util/file'

export default class Git {
	constructor(path) {
		if (!existsFile(path))
			throw new Error(`指定のディレクトリが存在しません`, path);
		if (!this.isRepository(path))
			throw new Error('指定されたディレクトリはGitリポジトリではありません', path);
		this.repositoryPath = path;
	}

	isRepository(path) {
		let files  = readDir(path ? path : this.repositoryPath);
		let result = files.filter(file => { return file === '.git' });
		return result.length > 0;
	}

	checkout(branchName) {
		this.execCommand(`git checkout ${branchName}`);
	}

	async execCommand(command) {
		const cwd = process.cwd();
		process.chdir(this.repositoryPath);
		const result = await execCmd(command);
		process.chdir(cwd);
		return result;
	}
}
