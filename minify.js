#!/usr/bin/env node

'use strict';

const fs = require('fs');
const {readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync} = require('fs');
const {join} = require('path');

const {blackList} = require('./config.json');

const path = require('path');

function getAllFiles(dirPath, ext) {

  function scandir(dirPath, ext) {
    const result = readdirSync(dirPath);
    if (!result.length) return [];
    return result.filter(name => !(blackList || []).includes(name)).map((dirName) => {
      const filePath = join(dirPath, dirName);
      if (statSync(filePath).isDirectory()) {
        return scandir(join(dirPath, dirName), ext);
      } else {
        if (!ext) return filePath;
        if (filePath.lastIndexOf(ext) === filePath.indexOf(ext) && filePath.indexOf(ext) > -1) {
          return filePath;
        }
        return '';
      }
    });
  }

  function flatten(arr) {
    return arr.reduce(function(flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  }

  return flatten(scandir(dirPath, ext)).filter(file => file);
}

module.exports = function(sourceDirPath) {
  console.log(`开始处理: ${sourceDirPath}`);

  const sourceDir = path.relative('.', sourceDirPath);

  const allMarkdownFiles = getAllFiles(sourceDir, '.md');
  let contentHasError = [];
  let contentHasMore = [];
  let contentHasErrMore = [];

  allMarkdownFiles.forEach((file) => {
    const content = readFileSync(file, 'utf-8');
    if (content.indexOf('{{<crayonCode>}}') > -1) contentHasError.push(file);

    if (content.indexOf('<!-- more -->') > -1) contentHasMore.push(file);

    // 统计标记错误的文章
    if (content.indexOf('<!-- More -->') > -1) contentHasErrMore.push(file);
    if (content.indexOf('<!-- -->') > -1) contentHasErrMore.push(file);
  });

  contentHasMore.forEach((file) => {
    const contentTrimmed = readFileSync(file, 'utf-8').replace(/<!-- more -->\n/g, '');
    writeFileSync(file, contentTrimmed);
  });

  if (contentHasError.length) {
    console.log(`[高亮存在错误] ${contentHasError.length}`);
    writeFileSync('./error.json', JSON.stringify(contentHasError.reduce((prev, item) => {
      const cachePath = join('./cache', item.replace(/\.\.\//g, '')).replace(/^\//g, '');
      prev[cachePath] = true;
      return prev;
    }, {})));
  } else {
    writeFileSync('./error.json', '{}');
  }

  if(contentHasErrMore.length){
    console.log(`[摘要标记错误] ${contentHasErrMore.length}`);
    console.log(contentHasErrMore);
  }
  // content.match(/<div id="crayon-.*<\/div><\/div><\/td><\/tr><\/table><\/div><\/div>/gm);

  console.log(
      // getAllFiles(sourceDir, '.html'),
  );

};
