// dev-reload-server.js
const WebSocket = require('ws');
const chokidar = require('chokidar');

const wss = new WebSocket.Server({ port: 35729 });
console.log('✅ Reload server listening on ws://localhost:35729');

wss.on('connection', () => console.log('Extension connected'));

const watcher = chokidar.watch('./', { // watch current folder
  ignored: /node_modules|\.git/,
  ignoreInitial: true,
});

watcher.on('all', (event, path) => {
  console.log(`🔧 Change detected: ${path}`);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send('reload');
  });
});
