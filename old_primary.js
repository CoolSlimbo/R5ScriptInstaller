const obj = require(`./style.json`)
const wget = require('wget-improved')
const fs = require('fs')
console.log(obj)

options = {}
options.gunzip = true

const name = obj.genInfo.name
const author = obj.genInfo.author
const zipDown = obj.genInfo.download
let useZipDown

if (zipDown === "") {
    useZipDown = false
} else if (zipDown === !"") {
    useZipDown = true
}

const fileTotal = obj.files
const fileLength = Object.keys(fileTotal).length
let fileLengthLoop = fileLength

function runMain() {
    let filesName = "file" + fileLengthLoop
    const fileSection = "obj.files" + filesName
    let fileName = fileSection.fileName
    let output = './tempscripts/' + fileName + '.zip'
    const outputDir = './tempscripts'

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    let download = wget.download(zipDown, output, options)

    download.on('progress', function (progress) {
        typeof progress === 'number'
    });
    while (fileLengthLoop != 0) {
        console.log(filesName)

        let location = fileSection.location

        fileLengthLoop = fileLengthLoop - 1
    }
}