const { ipcRenderer } = require('electron')
const wget = require('wget-improved')
const fs = require('fs')
const unzipper = require('unzipper')
const replace = require('replace-in-file')

let outputDir = undefined

var uploadFile = document.getElementById("upload")
var startProcess = document.getElementById("startProcess")
let fileLocation = undefined;
let appDir = undefined;

// Zip file infomation
let fileSelf = undefined;
let downloadLocation = undefined;
let output = undefined;
let modName = undefined;
let upzipLocation = undefined;

// Files infomation
let lengthOfFiles = undefined;
let files = undefined;
let modFileName = undefined;
let modFileLocation = undefined;
let modApendType = undefined;
let fileSectionName = undefined;

// Append infomation
let modAppendFileName = undefined;
let modAppendFileLocation = undefined;
let modAppendFileAddition = undefined;
let modAppendFileFrom = undefined;

ipcRenderer.on(`current-dir`, (event, message) => {
    appDir = message
    console.log(appDir)
    outputDir = `${appDir}/tempscripts`
})


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
        defaultPath: localStorage.getItem(`${appDir}`)
    })
    ipcRenderer.on('open-file-paths', (event, data) => {
        console.log(`Canceled? ${data.canceled}`);
        fileLocation = data.filePaths.join(';')
        console.log(fileLocation)
        fs.readFile(fileLocation, 'utf8', (err, data) => {
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

    download.on('error', function (err) {
        console.log(err);
    });
    download.on('progress', function (progress) {
        typeof progress === 'number'
    });
    download.on('end', function () {
        upzipLocation = `${outputDir}/${modName}`
        console.log(upzipLocation)

        fs.createReadStream(`${output}`)
            .pipe(unzipper.Extract({ path: `${upzipLocation}` }));


        //Move corresponding files to corresponding sections

        lengthOfFiles = Object.keys(fileSelf.files).length
        files = fileSelf.files

        for (let i = 0; i < lengthOfFiles; i++) {
            i = i + 1
            fileSectionName = `file${i}`
            //console.log(fileSectionName)

            modFileName = files[fileSectionName].fileName
            modFileLocation = files[fileSectionName].location
            modApendType = files[fileSectionName].appends

            modAppendFileName = files[fileSectionName].custom.name
            modAppendFileLocation = files[fileSectionName].custom.location
            modAppendFileAddition = files[fileSectionName].custom.add
            modAppendFileFrom = files[fileSectionName].custom.from

            fs.rename(`${upzipLocation}/${modFileName}`, `${appDir}/${modFileLocation}/${modFileName}`, (err) => {
                if (err) throw err
                console.log(`${modFileName} has been moved to ${modFileLocation}`)
            })

            switch (modApendType) {
                case wepCache:
                    let options = {
                        files: `${appDir}/${modFileLocation}_mapspawn.gnut`,
                        from: /PrecacheWeapon\( \$"mp_weapon_frag_drone" \)/g,
                        to: `PrecacheWeapon( $"mp_weapon_frag_drone )"\n\tPrecacheWeapon( $"${modFileName}" )\n`
                    }

                    replace(options)
                        .then(results => {
                            console.log('Replacement results:', results);
                        })
                        .catch(error => {
                            console.error('Error occurred:', error);
                        });

                    console.log(`Weapon Precached to _mapspawn.gnut`)
                    break;
                case custom:
                    if (modAppendFileFrom === ``) {
                        fs.appendFile(`${appDir}/${modAppendFileLocation}/${modAppendFileName}`, modAppendFileAddition, 'utf-8', (err) => {
                            if (err) throw err
                        })
                        console.log(`Append to ${modAppendFileName} at ${modAppendFileLocation} succesful.`)
                    } if (modAppendFileFrom !== ``)
                        options = {
                            files: `${appDir}/${modAppendFileLocation}/${modAppendFileName}`,
                            from: modAppendFileFrom,
                            to: modAppendFileAddition
                        }
                    replace(options)
                        .then(results => {
                            console.log('Replacement results:', results);
                        }).catch(error => {
                            console.error('Error occurred:', error);
                        });
                    break;
                default:
                    console.log(`Error. Invalid append type. Expected wepCache, custom, or nothing, not ${modApendType}`)
                    break;
            }
        }
        console.log(`Mods installed`)
    });
})


