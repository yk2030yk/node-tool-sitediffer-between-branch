import http from 'http';
import zlib from 'zlib';
import xml2js from 'xml2js';
import {
    unlink,
    createWriteStream,
    writeFile,
    readFile
} from './util/file';

export default class SitemapLoader {
    constructor(url) {;
        this.url = url;
        this.tmpDir       = 'tmp';
        this.gzipFileName = 'sitemap_tmp.xml.gz';
        this.xmlFileName  = 'sitemap_tmp.xml';
        this.gzipFilePath = `${this.tmpDir}/${this.gzipFileName}`;
        this.xmlFilePath  = `${this.tmpDir}/${this.xmlFileName}`;
    }

    async get() {
        try {
            await this.downloadGzip();
            await this.gunzip();
            const xml  = await this.getXml();
            const json = await this.parseXmlToJson(xml);
            const urls = this.getUrls(json);
            unlink(this.gzipFilePath);
            unlink(this.xmlFilePath);
            return urls;
        } catch(e) {
            console.log(e);
        }
    }

    async downloadGzip() {
        return new Promise((resolve, reject) => {
            let file = createWriteStream(this.gzipFilePath);
            http.get(this.url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            });
        });
    }

    async gunzip() {
        return new Promise((resolve, reject) => {
            let gzip = this.getGzip();
            zlib.gunzip(gzip, (err, binary) => {
                writeFile(this.xmlFilePath, binary);
                resolve();
            });
        });
    }

    getGzip() {
        return readFile(this.gzipFilePath);
    }

    getXml() {
        return readFile(this.xmlFilePath);
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
        sitemapJson.urlset.url.forEach(item => { urls.push(item.loc[0]) })
        return urls;
    }
}