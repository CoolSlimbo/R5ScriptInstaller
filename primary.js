const { ipcRenderer } = require("electron")
const wget = require('wget-improved')
const fs = require('fs')
const unzipper = require('unzipper')

var uploadFile = document.getElementById("upload")
var startProcess = document.getElementById("startProcess")
let fileLocation = undefined;

// Zip file infomation
let fileSelf = undefined;
let downloadLocation = undefined;
let output = undefined;
let modName = undefined;
let upzipLocation  = undefined;

// Files infomation
let lengthOfFiles = undefined;
let files = undefined;
let fileName = undefined;
let modFileLocation = undefined;
let modApendType = undefined;
let fileSectionName = undefined;

// Append infomation
let modAppendFileName = undefined;
let modAppendFileLocation = undefined;
let modAppendFileAddition = undefined;

const outputDir = "./tempscripts"


uploadFile.addEventListener('click', () => {
    // dialog.showOpenDialog({
    //      properties: ['openFile'],
    //      buttonLabel: "Upload",
    //      filters: 
    //         [{ name: 'Jason', 
    //         extensions: ['json']}] 
    // }) Old Code

    ipcRenderer.send('open-file', {
        title: 'Title',
        defaultPath: localStorage.getItem('./')
    })
    ipcRenderer.on('open-file-paths', (event, data) => {
        console.log(`Canceled? ${data.canceled}`);
        fileLocation = data.filePaths.join(';')
        console.log(fileLocation)
        fs.readFile(fileLocation, 'utf8' , (err, data) => {
            if (err) {
              console.error(err)
              return
            }
            fileSelf = data
          })
          
    })
})

startProcess.addEventListener('click', () => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    fileSelf = JSON.parse(fileSelf)

    console.log(fileSelf)
    
    //Download and unzip zip file to ./tempscripts
    downloadLocation = fileSelf.genInfo.download
    modName = fileSelf.genInfo.name
    output = `${outputDir}/${modName}.zip`
    let download = wget.download(downloadLocation, output);

    download.on('error', function(err) {
        console.log(err);
    });
    download.on('progress', function (progress) {
        typeof progress === 'number'
    });

    upzipLocation = `${outputDir}/${modName}`

    fs.createReadStream(`${output}`)
    .pipe(unzipper.Extract({ path: `${upzipLocation}` }));


    //Move corresponding files to corresponding sections

    lengthOfFiles = Object.keys(fileSelf.files).length
    files = fileSelf.files

    for (var lengthLoop = lengthOfFiles; lengthLoop > lengthOfFiles; lengthLoop++) {
        fileSectionName = `file${lengthLoop}`
        
    }

})