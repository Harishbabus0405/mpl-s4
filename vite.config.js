import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function auctionRealtimePlugin() {
  const STATE_FILE = path.resolve(__dirname, './.auction_shared_state.json');
  let currentState = null;

  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      currentState = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading saved auction state:', err);
  }

  function saveState(state) {
    currentState = state;
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (err) {
      console.error('Error saving auction state to file:', err);
    }
  }

  function setupWSS(httpServer) {
    const wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (request, socket, head) => {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);
        if (url.pathname === '/api/ws-auction') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        }
      } catch (err) {
        console.error('Upgrade error:', err);
      }
    });

    wss.on('connection', (ws) => {
      // Immediately send the latest state to the newly connected device
      if (currentState) {
        ws.send(JSON.stringify({
          type: 'INIT_STATE',
          payload: currentState,
          clientCount: wss.clients.size
        }));
      }

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'SYNC_STATE' && data.payload) {
            saveState(data.payload);
            const broadcastData = JSON.stringify({
              type: 'STATE_UPDATE',
              payload: data.payload,
              timestamp: Date.now()
            });

            // Broadcast to all other connected clients
            for (const client of wss.clients) {
              if (client.readyState === 1 && client !== ws) {
                client.send(broadcastData);
              }
            }
          } else if (data.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
        } catch (e) {
          console.error('Error processing WS message:', e);
        }
      });
    });

    return wss;
  }

  return {
    name: 'auction-realtime-server',
    configureServer(server) {
      const wss = setupWSS(server.httpServer);

      // HTTP fallback endpoints for environments where WebSockets might be proxy-blocked
      server.middlewares.use('/api/auction-state', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(currentState || {}));
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const state = JSON.parse(body);
              saveState(state);
              const broadcastData = JSON.stringify({
                type: 'STATE_UPDATE',
                payload: state,
                timestamp: Date.now()
              });
              for (const client of wss.clients) {
                if (client.readyState === 1) {
                  client.send(broadcastData);
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
        }
      });
    },
    configurePreviewServer(server) {
      setupWSS(server.httpServer);
    }
  };
}

export default defineConfig({
  plugins: [react(), auctionRealtimePlugin()],
  server: {
    port: 3000,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
