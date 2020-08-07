export function sleep(time) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
	    	resolve()
	    }, time)
	})
}

export function setInterval(callback, limit, time) {
	return new Promise((resolve, reject) => {
		let count = 0
		let id = setInterval(() => {
			if (++count >= limit) {
				clearInterval(id)
				resolve()
			}
			callback(count)
		}, time)
	})
}

export function isUndef (v) {
	return v === undefined || v === null
}

export function isDef (v) {
	return v !== undefined && v !== null
}