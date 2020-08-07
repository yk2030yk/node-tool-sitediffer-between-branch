require('date-utils');
const fs = require("fs");
const url = require('url');
const http = require('http');
const zlib = require('zlib');
const child_process = require('child_process');
const xml2js = require("xml2js");

module.exports = class XmlLoader {
    constructor(opt) {
        this.opt = Object.assign({
            url: '',
            tmp: 'tmp',
            gzip: 'sitemap.xml.gz',
            xml: 'sitemap.xml',
        }, opt);
    }

    async get() {
        try {
            await this.downloadSitemapGzip();
            await this.gunzipSitemapGzip();
            const xml  = await this.getXml();
            const json = await this.parseXmlToJson(xml);
            const urls = this.getUrls(json);
            return urls;
        } catch(e) {console.log(e);}
    }

    async downloadSitemapGzip() {
        return new Promise((resolve, reject) => {
            let file = fs.createWriteStream(`${this.opt.tmp}/${this.opt.gzip}`);
            http.get(this.opt.url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                    file.close();
                    resolve();
                });
            });
        });
    }

    async gunzipSitemapGzip() {
        return new Promise((resolve, reject) => {
            var gzip = fs.readFileSync(`${this.opt.tmp}/${this.opt.gzip}`);
            zlib.gunzip(gzip, (err, binary) => {
                fs.writeFileSync(`${this.opt.tmp}/${this.opt.xml}`, binary);
                resolve();
            });
        });
    }

    async getXml(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(`${this.opt.tmp}/${this.opt.xml}`, (err, data) => {
                if (err) {
                    reject(["ファイルの読み込みに失敗しました。", path, err]);
                } else {
                    resolve(data);
                }
                return;
            });
        });
    }

    async parseXmlToJson(xml) {
        return new Promise((resolve, reject) => {
            let list = [];
            xml2js.parseString(xml.toString(), (err, json) => {
                if (err) {
                    reject(["XMLをjson形式にパースするのに失敗しました。", xml, err]);
                } else {
                    resolve(json);
                }
                return;
            });
        });
    }

    getUrls(sitemapJson) {
        let urls = [];
        sitemapJson.urlset.url.forEach((item) => {
            urls.push(item.loc[0]);
        })
        return urls;
    }
}