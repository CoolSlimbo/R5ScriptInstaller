const { app, BrowserWindow, ipcMain } = require('electron')
const { dialog } = require('electron')
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
