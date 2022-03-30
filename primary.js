const { ipcRenderer } = require("electron")
const wget = require('wget-improved')
const fs = require('fs')

var uploadFile = document.getElementById("upload")
var startProcess = document.getElementById("startProcess")
let fileLocation = undefined;

let fileSelf = undefined;
let downloadLocation = undefined;
let output = undefined;
let modName = undefined;
let lengthOfFiles = undefined;

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

    lengthOfFiles = Object.keys(fileSelf.files).length


    //Move corresponding files to corresponding sections
})