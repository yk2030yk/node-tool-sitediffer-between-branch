export const STATE_START  = '#';
export const STATE_ACTION = '+';
export const STATE_END    = '#';
export const STATES = {
	0: STATE_START,
	1: STATE_ACTION,
	2: STATE_END,
}

export function log(message, id = 1) {
	console.log(`[${STATES[id]}]: ${message}`);
}