const express = require('express');
const router  = express.Router();
const WebsocketSession = require('../models/WebsocketSession');
const WebsocketMessage = require('../models/WebsocketMessage');
const { verifyJwt }     = require('../middleware/authMiddleware');

// Список сессий текущего пользователя
router.get('/', verifyJwt, async (req, res) => {
  const sessions = await WebsocketSession.find({ userId: req.user.id }).lean();
  res.json(sessions);
});

// Создать новую сессию
router.post('/', verifyJwt, async (req, res) => {
  const { connectionId, name, url, protocols, headers, autoConnect, saveMessages } = req.body;
  const session = new WebsocketSession({
    userId: req.user.id,
    connectionId, name, url, protocols, headers, autoConnect, saveMessages
  });
  await session.save();
  res.status(201).json(session);
});

// Логировать сообщение
router.post('/:connectionId/messages', verifyJwt, async (req, res) => {
  const sess = await WebsocketSession.findOne({ userId: req.user.id, connectionId: req.params.connectionId });
  if (!sess) return res.status(404).json({ message: 'Session not found' });
  const msg = new WebsocketMessage({ session: sess._id, ...req.body });
  await msg.save();
  res.status(201).json(msg);
});

// Получить все сообщения сессии
router.get('/:connectionId/messages', verifyJwt, async (req, res) => {
  const sess = await WebsocketSession.findOne({ userId: req.user.id, connectionId: req.params.connectionId });
  if (!sess) return res.status(404).json({ message: 'Session not found' });
  const msgs = await WebsocketMessage.find({ session: sess._id }).sort('timestamp');
  res.json(msgs);
});

// Закрыть сессию
router.patch('/:connectionId/close', verifyJwt, async (req, res) => {
  const sess = await WebsocketSession.findOneAndUpdate(
    { userId: req.user.id, connectionId: req.params.connectionId },
    { closedAt: new Date() }, { new: true }
  );
  res.json(sess);
});

// Удалить сессию и все её сообщения
router.delete('/:connectionId', verifyJwt, async (req, res) => {
  const sess = await WebsocketSession.findOneAndDelete({ userId: req.user.id, connectionId: req.params.connectionId });
  if (!sess) return res.status(404).json({ message: 'Session not found' });
  await WebsocketMessage.deleteMany({ session: sess._id });
  res.status(204).end();
});



module.exports = router;
