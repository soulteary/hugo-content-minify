#!/usr/bin/env node

'use strict';

const scandir = require('scandirectory');

const fs = require('fs');
const {readFileSync, writeFileSync, existsSync, mkdirSync} = require('fs');

const path = require('path');

// todo enable useCodeHighlight feature
module.exports = function (sourceDirPath) {
    console.log(sourceDirPath)

    const sourceDir = path.relative('.', sourceDirPath);

    function completionCallback(err, list, data) {
        if (err) {
            return console.error(err);
        }

        let processFiles = [];
        Object.keys(list).forEach(function (label) {
            if ('file' === list[label] && (label.endsWith('.html') || label.endsWith('.xml'))) {
                processFiles.push(`${sourceDirPath}/${label}`);
            }
        });


        console.log(processFiles.slice(0, 1))


        var a = ['sitemap.xml'];

        var d = ['report.html'];

        processFiles
            .slice(0, 15)
            .forEach(function (file) {
                const content = (fs.readFileSync(file)).toString();
                // fs.writeFileSync(source, content.replace(/\s+/,''));

                console.log(file);
                console.log(
                    content
                        .match(/<div id="crayon-.*<\/div><\/div><\/td><\/tr><\/table><\/div><\/div>/gm)

                        // .replace(/>\s+</g, '><')
                        // .replace(/>(\s+\n|\r)/g, '>')
                )
            });

        // $html = preg_replace( array( '/>\s+</Um', '/>(\s+\n|\r)/' ), array( '><', '>' ), $html );

    }

    scandir(sourceDir, {
        ignoreHiddenFiles: true,
        ignoreCustomPatterns: /\.(js|css|jpg|png|bmp|jpeg)$/
    }, completionCallback)
};
