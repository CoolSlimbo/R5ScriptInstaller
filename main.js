const { app, BrowserWindow, ipcMain } = require('electron')
const { dialog } = require('electron')
const appDir = process.env.PORTABLE_EXECUTABLE_DIR
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    win.loadFile('index.html')

    win.webContents.on(`did-finish-load`, () => {
        win.webContents.send(`current-dir`, appDir)
    })
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('open-file', (event, data) => {
    dialog.showOpenDialog({
         properties: ['openFile'],
         buttonLabel: "Upload",
         filters: 
            [{ name: 'Jason', 
            extensions: ['json']}] 
    }).then(filePaths => {
        event.sender.send('open-file-paths', filePaths);
    });
});