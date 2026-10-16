let ioInstance;

function initSocket(server) {
  const { Server } = require('socket.io');
  const origins = (process.env.CLIENT_URLS || '').split(',').map(s => s.trim()).filter(Boolean);
  const cors = origins.length ? { origin: origins } : { origin: true };

  ioInstance = new Server(server, { cors });
  ioInstance.use((socket, next) => {
    // optional: validate token in socket.handshake.auth.token and attach user info
    // if you already have JWT auth middleware, verify token here and set socket.userId and socket.isAdmin
    next();
  });

  ioInstance.on('connection', (socket) => {
    // server-side safety: don't auto-join rooms; client should request join
    socket.on('joinConversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });
  });

  return ioInstance;
}

function getIo() {
  if (!ioInstance) throw new Error('Socket not initialized');
  return ioInstance;
}

module.exports = { initSocket, getIo };
