const { ipcRenderer } = require('electron')
const { shell } = require('electron')
const wget = require('wget-improved')
const fs = require('fs')
const unzipper = require('unzipper')
const replace = require('replace-in-file')
const bootstrap = require('bootstrap')
window.$ = window.jQuery = require('jquery')

let genJsonFileNumber = 1;

let htmlAdd = undefined;
let append = undefined;


let outputDir = undefined

var uploadFile = document.getElementById("upload")
var startProcess = document.getElementById("startProcess")
var addHtml = document.getElementById("createMore")
let fileLocation = undefined;
let appDir = undefined;

// For bootstrap
/* global bootstrap: false */
(function () {
    'use strict'
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl)
    })
})()


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

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
})

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

            fs.rename(`${upzipLocation}/${modFileName}`, `${appDir}/${modFileLocation}/${modFileName}`, (err) => {
                if (err) throw err
                console.log(`${modFileName} has been moved to ${modFileLocation}`)
            })

            switch (modApendType) {
                case "wepCache":
                    let options = {
                        files: `${appDir}/platform/scripts/vscripts/_mapspawn.gnut`,
                        from: /PrecacheWeapon\( \$"mp_weapon_frag_drone" \)/g,
                        to: `PrecacheWeapon( $"mp_weapon_frag_drone" )\n    PrecacheWeapon( $"${modFileName}" )`
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
                case "custom":
                    modAppendFileName = files[fileSectionName].custom.name
                    modAppendFileLocation = files[fileSectionName].custom.location
                    modAppendFileAddition = files[fileSectionName].custom.add
                    modAppendFileFrom = files[fileSectionName].custom.from
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


//Links variables
var twitterLink = document.getElementById("twitter")
var githubLink = document.getElementById("github")
var discordServerLink = document.getElementById("discordServer")
var discordPersonalLink = document.getElementById("discordPersonal")

//Links
twitterLink.addEventListener('click', () => {
    shell.openExternal('https://twitter.com/CoolSlimbo')
})
githubLink.addEventListener('click', () => {
    shell.openExternal('https://github.com/SuperSlimey5/R5ScriptInstaller')
})
discordServerLink.addEventListener('click', () => {
    shell.openExternal("https://discord.gg/zvxbfBFY95")
})
discordPersonalLink.addEventListener('click', () => {
    shell.openExternal("https://discordapp.com/users/711359126139175053")
})


addHtml.addEventListener('click', () =>{
    const newDiv = document.createElement("div")
    append = document.getElementById(`file${genJsonFileNumber}`)
    genJsonFileNumber++
    htmlAdd = `<br>
    <div class="container border rounded border-success" id="file${genJsonFileNumber}">
    <p id="fileNumber">File ${genJsonFileNumber}<button type="button" class="btn-close float-end" aria-label="Close" id="closeButton${genJsonFileNumber}"></button></p>
    <div class="mb-2">
        <label for="fileName${genJsonFileNumber}" class="form-label" data-bs-toggle="tooltip"
            data-bs-placement="right" title="Should include file extension.">File Name</label>
        <input type="text" class="form-control" placeholder="mp_weapon_dope.txt" id="fileName${genJsonFileNumber}">
    </div>
    <div class="mb-2">
        <label for="location${genJsonFileNumber}" class="form-label" data-bs-toggle="tooltip"
            data-bs-placement="right"
            title="From platform. E.g. platform/scipts/weapons">Location</label>
        <input type="text" class="form-control" placeholder="I'll make this a file select lol"
            id="location${genJsonFileNumber}">
    </div>
    <div class="mb-2">
        <label for="appends${genJsonFileNumber}" class="form-label" data-bs-toggle="tooltip"
            data-bs-placement="right" title="">Append Type</label>
        <select name="Append Options" id="appendTypes" class="form-select">
            <option value="1">Nothing</option>
            <option value="2">Weapon Precache - Automatically precaches the weapon.</option>
            <option value="3">Custom - Use below values for custom.</option>
        </select>
        <br>
        <div class="container border rounded border-dark" id="">
            <h6>Custom Append Values</h6>
            <div class="mb-2">
                <label for="appendName${genJsonFileNumber}" class="form-label" data-bs-toggle="tooltip"
                    data-bs-placement="right" title="Should include file extension.">Append File
                    Name</label>
                <input type="text" class="form-control" placeholder="I honestly don't know"
                    id="appendName${genJsonFileNumber}">
            </div>
            <div class="mb-2">
                <label for="appendLocation${genJsonFileNumber}" class="form-label" data-bs-toggle="tooltip"
                    data-bs-placement="right" title="Goes from path">File Name</label>
                <input type="text" class="form-control" placeholder="platform/scripts/vscripts"
                    id="appendLocation${genJsonFileNumber}">
            </div>
            <div class="mb-2">
                <label for="appendAdd${genJsonFileNumber}" class="form-label" data-bs-toggle="tooltip"
                    data-bs-placement="right" title="">Append Addition</label>
                <input type="text" class="form-control" placeholder="Can be anythign lol"
                    id="appendAdd${genJsonFileNumber}">
            </div>
            <div class="mb-2">
                <label for="appendFrom${genJsonFileNumber}" class="form-label" data-bs-toggle="tooltip"
                    data-bs-placement="right"
                    title="Where to append from. This is made on a new line">File Name</label>
                <input type="text" class="form-control" placeholder="Anything, once again"
                    id="appendFrom${genJsonFileNumber}">
            </div>
        </div>
    </div>
    </div>`

    newDiv.innerHTML = htmlAdd
    append.parentNode.append(newDiv)

    addHtml.parentNode.appendChild(document.getElementById("createMore"))

    const closeButton = document.getElementById(`closeButton${genJsonFileNumber}`)

    closeButton.addEventListener('click', () => {
        closeButton.parentNode.parentNode.remove()
    })
})