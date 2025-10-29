

const WebSocket = require('ws');
const chokidar = require('chokidar');

let ws;
function connect() {
  ws = new WebSocket('ws://localhost:35729'); // match your dev server port
  ws.onopen = () => console.log('dev socket open');
  ws.onmessage = (ev) => {
    const msg = ev.data;
    if (msg === 'reload' || msg === 'built') {
      console.log('Reloading extension (dev)...');
      chrome.runtime.reload();
    }
  };
  ws.onclose = () => setTimeout(connect, 1000);
  ws.onerror = (e) => console.error('ws err', e);
}
connect();
