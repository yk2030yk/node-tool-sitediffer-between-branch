'use strict';

var _Util = require('./lib/util/Util.js');

var _Util2 = _interopRequireDefault(_Util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const puppeteer = require('puppeteer');
const simpleGit = require('simple-git');
const config = require('./config');

const XmlLoader = require('./lib/loader/XmlLoader');

(async function () {
  const ls = new LoadSitemap({
    url: `http://domain1.on.cld-vm.s-bs.jp/sitemap_pc1.xml.gz`
  });
  let d = await ls.get();
  console.log(d);
})();

if (!_Util2.default.fileExists(config.git.repository)) {
  console.log('ディレクトリがありません');
}

const git = simpleGit(config.git.repository);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://design_template.on.rc-stg.s-bs.jp/');
  await page.screenshot({ path: 'example.png', fullPage: true });
  await browser.close();
})();
