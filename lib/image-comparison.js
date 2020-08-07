import compareImages from "resemblejs/compareImages"
import {
	existsFile,
	readFile
} from './util/file'
import { isDef } from './util/util'

export const COMPARE_SATATUS_BEFORE_COMPARE = -1;
export const COMPARE_SATATUS_MATCHED        = 0;
export const COMPARE_SATATUS_MISMATCHED     = 1;

export default class ImageComparison {
	constructor(imagePathA, imagePathB) {
		if (!existsFile(imagePathA))
			throw new Error(`指定のディレクトリが存在しません`, imagePathA);
		if (!existsFile(imagePathB))
			throw new Error(`指定のディレクトリが存在しません`, imagePathB);
		this.data = {
			pathA: imagePathA,
			pathB: imagePathB,
			result: undefined
		}
	}

	async compare() {
	    this.data.result = await compareImages(
	        readFile(this.data.pathA), 
	        readFile(this.data.pathB),
	        {
	            output: {
	                errorColor: { red: 255, green: 0, blue: 0 },
	                errorType: "movement",
	                transparency: 0.7,
	                largeImageThreshold: 1200,
	                useCrossOrigin: false,
	                outputDiff: true
	            },
	            scaleToSameSize: true,
	            ignore: "antialiasing"
	        }
	    )
	    return this.data.result
	}

	getData() {
		return this.data
	}

	isCompared() {
		return isDef(this.data.result)
	}

	hasDiff(threshold = 0) {
		if (!this.isCompared())
			return COMPARE_SATATUS_BEFORE_COMPARE
		return this.data.result.misMatchPercentage > threshold ? 
			COMPARE_SATATUS_MISMATCHED : COMPARE_SATATUS_MATCHED
	}
}