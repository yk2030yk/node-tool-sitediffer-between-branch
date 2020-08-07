import {
	mkdirBeforeCheckExists,
	writeFile
} from './util/file'
import { COMPARE_SATATUS_MISMATCHED } from './image-comparison'

export default class ComparisonReportCreator {
	constructor(option = {}) {
		this.option = Object.assign({
			outputDir: 'output',
			outputDiffImageDir: 'diff',
			isOutputDiffImage: false,
			threshold: 0.5
		}, option);
		this.imageComparisons = []
		this.index = 0;

		mkdirBeforeCheckExists(this.option.outputDir);
		if (this.option.isOutputDiffImage)
			mkdirBeforeCheckExists(`${this.option.outputDir}/${this.option.outputDiffImageDir}`);
	}

	push(imageComparison) {
		this.imageComparisons.push(imageComparison);
	}

	createReportStr(sep = '') {
		let str = ''
		const reports = this.getReports()
		for (let report of reports) {
			str += report.join(sep) + "\n"
		}
		return str
	}

	create_csv() {
		return this.createReportStr(',')
	}

	create_tsv() {
		return this.createReportStr("\t")
	}

	getReports() {
		let reports = []
		for (let ic of this.imageComparisons) {
			reports.push(this.getReport(ic))
		}
		return reports
	}

	getReport(imageComparison) {
	    let repo
	    if (imageComparison.hasDiff(this.option.threshold) == COMPARE_SATATUS_MISMATCHED) {
	        repo = this.getSuccessReport(imageComparison)
	    } else {
	    	repo = this.getMisMatchReport(imageComparison)
	    }
	    return repo
	}

	getSuccessReport(imageComparison) {
		let report = []
		const data = imageComparison.getData()
		report[0] = data.pathA
	    report[1] = data.pathB
	    report[2] = false
	    report[3] = '0%'
	    report[4] = ''
	    return report
	}

	getMisMatchReport(imageComparison) {
		let report = []
		const data = imageComparison.getData()
		report[0] = data.pathA
	    report[1] = data.pathB
	    report[2] = true
	    report[3] = `${data.result.misMatchPercentage}%`
	    report[4] = ''

	    if (this.option.isOutputDiffImage) {
	    	report[4] = `${this.option.outputDir}/${this.option.outputDiffImageDir}/diff${this.index++}.png`
	    	writeFile(report[4], data.result.getBuffer())
	    }
	    return report
	}

	save() {
		let tsv = this.create_tsv()
		writeFile(`${this.option.outputDir}/reports.tsv`, tsv)
	}
}