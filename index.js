import Git from './lib/Git.js';
const puppeteer = require('puppeteer');
const config = require('./config');
const XmlLoader = require('./lib/loader/XmlLoader');
const compareImages = require("resemblejs/compareImages");
const fs = require('fs');


const git = new Git(config.git.repository);
const branchs  = ['697f543', 'b2aa10a'];
const sitemapUrl = `http://domain1.on.cld-vm.s-bs.jp/sitemap_pc1.xml.gz`;

async function compareDiff(filePath1, filePath2) {
    const data = await compareImages(
        fs.readFileSync(filePath1), 
        fs.readFileSync(filePath2),
        {
            output: {
                errorColor: { red: 255, green: 255, blue: 0 },
                errorType: "movement",
                transparency: 0.2,
                largeImageThreshold: 1200,
                useCrossOrigin: false,
                outputDiff: true
            },
            scaleToSameSize: true,
            ignore: "antialiasing"
        }
    );
    return data;
}

const reportFile = `tmp/report.tsv`;
let pindex = 0;
function createReport(data, filePath1, filePath2) {
    let report = [];
    report[0] = filePath1;
    report[1] = filePath2;
    report[2] = 0;
    report[3] = 0;
    report[4] = '';

    if (data.misMatchPercentage > 0) {
        report[2] = 1;
        report[3] = data.misMatchPercentage;
        report[4] = `tmp/diff/diff${pindex++}.png`;
        fs.writeFileSync(report[4], data.getBuffer());
    }
    return report.join("\t");
}

(async function() {
  const xl = new XmlLoader({ url: sitemapUrl });
  let urls = await xl.get();
  urls = urls.slice(1, 4);

  console.log("[START]: デクレチェッカーを開始します");
  console.log("[ACTION]: スクリーンショットの撮影を開始します");

  for (let branch of branchs) {
    console.log(`\t=========\n\tBranch: ${branch}\n\t=========`);
    git.checkout(branch);

    let index = 0;
    for (let url of urls) {
      console.log(`\tスクリーンショット開始: ${url}`);
      let sspath = `tmp/screenshots/${branch}_${++index}.png`;
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url);
      await page.screenshot({path: sspath, fullPage:true});
      await browser.close();
      console.log(`\t=> ${sspath}`);
    }
  }

  console.log("[ACTION]: デグレチェックを開始します");

  let index = 0;
  for (let url of urls) {
    console.log(`\tスクリーンショット比較: ${url}`);
    ++index;
    let p1 = `tmp/screenshots/${branchs[0]}_${index}.png`;
    let p2 = `tmp/screenshots/${branchs[1]}_${index}.png`;
    
    const data = await compareDiff(p1, p2);
    let repo = createReport(data, p1, p2);
    fs.appendFileSync(reportFile, repo + "\n");
    console.log("\t=> success!");
  }
  console.log(`[END]: 結果を${reportFile}に出力しました！`);
})();
