import puppeteer from 'puppeteer'
import { mkdirBeforeCheckExists } from './util/file'

module.exports = class SitemapLoader {
	constructor(dir = 'tmp/screenshots') {
        this.outputDir = dir
        mkdirBeforeCheckExists(this.outputDir)
    }

    async shot(url, filename) {
		const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setViewport({width: 1920, height: 1080})
        await page.goto(url)
        await page.screenshot({path: `${this.outputDir}/${filename}`, fullPage: true})
        await browser.close()
    }
}