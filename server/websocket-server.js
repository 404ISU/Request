const WebSocket = require('ws');
const jwt       = require('jsonwebtoken');
const axios     = require('axios');

class WebSocketServer {
  constructor(httpServer) {
    this.wss = new WebSocket.Server({
      server: httpServer,
      verifyClient: ({ req }, done) => {
        const token = req.headers['sec-websocket-protocol'];
        jwt.verify(token, process.env.JWT_SECRET, err => done(!err));
      }
    });

    this.http = axios.create({
      baseURL: process.env.API_URL,           // e.g. http://localhost:5000
      headers: { Authorization: `Bearer ${process.env.API_TOKEN}` }
    });
    this.sessions = new Map();
    this.setupHandlers();
  }

  setupHandlers() {
    this.wss.on('connection', async (ws, req) => {
      const token    = req.headers['sec-websocket-protocol'];
      const decoded  = jwt.verify(token, process.env.JWT_SECRET);
      const params   = new URL(req.url, `http://${req.headers.host}`).searchParams;
      const collectionId = params.get('collectionId') || null;
      const sessionId   = decoded.id + ':' + Date.now();

      this.sessions.set(sessionId, { ws, messages: [] });

      // Создать запись в БД
      await this.http.post('/api/websocket/history', {
        connectionId: sessionId,
        name: decoded.username,
        url: req.url,
        protocols: [],
        headers: {},
        autoConnect: false,
        saveMessages: true
      });

      ws.on('message', data => this.handleMessage(sessionId, data));
      ws.on('close', ()     => this.handleClose(sessionId));
    ws.on('error', err => {
  console.error('WebSocket error:', err);
  this.sendError(sessionId, err.message);
  this.handleClose(sessionId);
});

      this.sendSystem(sessionId, 'Connection established');
    });
  }

  async handleMessage(sessionId, raw) {
    const session = this.sessions.get(sessionId);
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      msg = { type: 'SEND', content: raw };
    }

    // Логируем как OUTGOING
    await this.http.post(`/api/websocket/history/${sessionId}/messages`, {
      direction: 'OUTGOING', content: msg.content || raw
    });

    // Если тип CONNECT — переподключаем и т.д. Для простоты ответим эхом:
    session.ws.send(raw);

    // Логируем как SYSTEM reply
    await this.http.post(`/api/websocket/history/${sessionId}/messages`, {
      direction: 'SYSTEM', content: 'Echo: ' + raw
    });
  }

  async handleClose(sessionId) {
    await this.http.patch(`/api/websocket/history/${sessionId}/close`);
    this.sessions.delete(sessionId);
  }

  sendSystem(sessionId, text) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.ws.send(JSON.stringify({ type: 'SYSTEM', content: text }));
    this.http.post(`/api/websocket/history/${sessionId}/messages`, {
      direction: 'SYSTEM', content: text
    }).catch(console.error);
  }

  sendError(sessionId, text) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.ws.send(JSON.stringify({ type: 'ERROR', content: text }));
    this.http.post(`/api/websocket/history/${sessionId}/messages`, {
      direction: 'ERROR', content: text
    }).catch(console.error);
  }
}

module.exports = WebSocketServer;
