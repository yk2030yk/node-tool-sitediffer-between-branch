import fs from 'fs';

export function existsFile(path) {
    try{
        fs.accessSync(path)
        return true;
    } catch(e) {
        return false;
    }
}

export function mkdirBeforeCheckExists(path) {
    if (!existsFile(path)) fs.mkdirSync(path);
}

export function readDir(path) {
    return fs.readdirSync(path);
}

export function readFile(path) {
    return fs.readFileSync(path);
}

export function writeFile(path, buffer) {
    return fs.writeFileSync(path, buffer);
}

export function unlink(path) {
    return fs.unlinkSync(path);
}

export function createWriteStream(path) {
    return fs.createWriteStream(path);
}

export function escapeFileName(str, replace = '') {
    return str.replace(/\//g, replace);
}