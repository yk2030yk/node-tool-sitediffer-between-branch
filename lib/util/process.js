import { exec } from 'child_process'

export function execCmd(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error) return reject(error);
			return resolve({
				stdout: stdout,
				stderr: stderr
			})
		})
	})
}