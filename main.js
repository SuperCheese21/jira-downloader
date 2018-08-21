const { app, BrowserWindow, Menu } = require('electron');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        title: 'JIRA Downloader',
        width: 450,
        height: 650,
        center: true,
        autoHideMenuBar: true,
        resizable: false,
        backgroundColor: '#e0e0e0'
    });

    mainWindow.loadFile('./public/index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.setMenu(getMenu());
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});

function getMenu() {
    const template = [
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo'
                }, {
                    role: 'redo'
                }, {
                    type: 'separator'
                }, {
                    role: 'cut'
                }, {
                    role: 'copy'
                }, {
                    role: 'paste'
                }, {
                    role: 'pasteandmatchstyle'
                }, {
                    role: 'delete'
                }, {
                    role: 'selectall'
                }
            ]
        }, {
            label: 'View',
            submenu: [
                {
                    role: 'reload'
                }, {
                    role: 'forcereload'
                }, {
                    role: 'toggledevtools'
                }, {
                    type: 'separator'
                }, {
                    role: 'resetzoom'
                }, {
                    role: 'zoomin'
                }, {
                    role: 'zoomout'
                }, {
                    type: 'separator'
                }, {
                    role: 'togglefullscreen'
                }
            ]
        }, {
            role: 'window',
            submenu: [
                {
                    role: 'minimize'
                }, {
                    role: 'close'
                }
            ]
        }, {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {
                        require('electron').shell.openExternal('https://electronjs.org')
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    role: 'about'
                }, {
                    type: 'separator'
                }, {
                    role: 'services',
                    submenu: []
                }, {
                    type: 'separator'
                }, {
                    role: 'hide'
                }, {
                    role: 'hideothers'
                }, {
                    role: 'unhide'
                }, {
                    type: 'separator'
                }, {
                    role: 'quit'
                }
            ]
        })

        template[1].submenu.push({
            type: 'separator'
        }, {
            label: 'Speech',
            submenu: [
                {
                    role: 'startspeaking'
                }, {
                    role: 'stopspeaking'
                }
            ]
        })

        template[3].submenu = [
            {
                role: 'close'
            }, {
                role: 'minimize'
            }, {
                role: 'zoom'
            }, {
                type: 'separator'
            }, {
                role: 'front'
            }
        ]
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
}
