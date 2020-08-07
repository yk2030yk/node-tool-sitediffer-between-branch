import Git from './git'
import ComparisonReportCreator from './comparison-report-creator'
import {
    default as ImageComparison,
    COMPARE_SATATUS_MISMATCHED
} from './image-comparison'
import SitemapLoader from './sitemap-loader'
import Screenshot from './screenshot'
import config from './config'
import { log } from './util/logger'
import {
    escapeFileName,
    unlink,
    existsFile,
    readFile
} from './util/File'

const SCREENSHOT_DIR = 'tmp/screenshots';

(async function() {
    const branchA = process.argv[3]
    const branchB = process.argv[4]
    if (!branchA || !branchB) {
        throw new Error("引数が2つ指定されていません。");
    }
    const branchs = [branchA, branchB];
    let imagePathList = {}
    imagePathList[branchA] = {}
    imagePathList[branchB] = {}

    log("デクレチェッカーを開始します", 0)
    
    let urls = [];
    if (config.mode === 'sitemap') {
        log("サイトマップのダウンロード中...")
        const sitemapLoader = new SitemapLoader(config.sitemap.url)
        urls = await sitemapLoader.get()
        urls = urls.slice(1, 3)
    } else if (config.mode === 'file') {
        log("URL一覧の読み込み中...")
        if (!existsFile(config.file.path))
            throw new Error("ファイルが存在しません。", config.file.path);
        const txt = readFile(config.file.path)
        urls = `${txt}`.split("\n")
    }

    if (urls.length === 0) {
        throw new Error("スクリーンショット対象のURLが1つも存在していません。");
    }

    log("スクリーンショットの撮影を開始します")
    
    const git = new Git(config.git.repository)
    const screenshot = new Screenshot(SCREENSHOT_DIR)
    for (let branch of branchs) {
        log(`ブランチを変更しました => ${branch}`)
        git.checkout(branch)
        
        let uniqueIndex = 0
        for (let url of urls) {
            log(`スクリーンショット中... ${url}`)
            imagePathList[branch][url] = `${escapeFileName(branch)}_${uniqueIndex++}.png`
            await screenshot.shot(url, imagePathList[branch][url])
        }
    }

    log("デグレチェックを開始します")

    const comparisonReportCreator = new ComparisonReportCreator({
        outputDir: 'output',
        outputDiffImageDir: 'diffimage',
        isOutputDiffImage: true,
        threshold: 0.5
    })
    for (let url of urls) {
        log(`画像比較中... ${url}`)
        const imageComparison = new ImageComparison(
            `${SCREENSHOT_DIR}/${imagePathList[branchA][url]}`,
            `${SCREENSHOT_DIR}/${imagePathList[branchB][url]}`
        )
        await imageComparison.compare()
        comparisonReportCreator.push(imageComparison)

        const data = imageComparison.getData();
        if (imageComparison.hasDiff(0.5) === COMPARE_SATATUS_MISMATCHED) {
            unlink(data.pathA)
            unlink(data.pathB)
        }
    }
    comparisonReportCreator.save()

    log(`デクレチェックが完了しました。`, 2)
})()
