import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Chip, Collapse, Paper, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Cookies from 'js-cookie';

import ConnectionForm from './Connection/ConnectionForm';
import ConnectionList from './Connection/ConnectionList';
import ConnectionPanel from './Connection/ConnectionPanel';
import EmptyState from './State/EmptyState';

// чтобы куки отправлялись автоматически
axios.defaults.withCredentials = true;

const WebSocketClient = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [connections, setConnections] = useState([]);
  const [activeConnectionId, setActiveConnectionId] = useState(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const token = Cookies.get('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const activeConn = connections.find(c => c.id === activeConnectionId);

  // 1) при монтировании — подгружаем все сохранённые WebSocket-сессии
  useEffect(() => {
    axios.get('/api/websocket/history')
      .then(({ data }) => {
        // data — массив объектов WebsocketSession из БД
        // Приведём их к формату connections:
        const loaded = data.map(sess => ({
          id: sess.connectionId,
          name: sess.name || `Session ${sess.connectionId}`,
          url: sess.url,
          protocols: sess.protocols || [],
          headers: sess.headers || {},
          autoConnect: sess.autoConnect,
          saveMessages: sess.saveMessages,
          status: 'disconnected',
          messages: [],          // можно потом докачать сообщения, если нужно
          createdAt: new Date(sess.createdAt)
        }));
        setConnections(loaded);
      })
      .catch(err => {
        console.error('Load history failed', err);
        enqueueSnackbar('Не удалось загрузить историю WebSocket-сессий', { variant: 'error' });
      });
  }, [enqueueSnackbar]);

  // Вспомогательные функции работы с сервером
  const createSessionOnServer = conn =>
    axios.post('/api/websocket/history', {
      connectionId: conn.id,
      name: conn.name,
      url: conn.url,
      protocols: conn.protocols,
      headers: conn.headers,
      autoConnect: conn.autoConnect,
      saveMessages: conn.saveMessages
    });

  const logMessageOnServer = (connectionId, direction, content) =>
    axios.post(`/api/websocket/history/${connectionId}/messages`, {
      direction,
      content,
      timestamp: new Date()
    });

  const closeSessionOnServer = connectionId =>
    axios.patch(`/api/websocket/history/${connectionId}/close`, {});

  // при выборе соединения подгружаем сообщения
  const selectConnection = async(id)=>{
    setActiveConnectionId(id);
    // загрузить сообщение при переключения
    try {
      const {data: msgs} = await axios.get(`/api/websocket/history/${id}/messages`);
      setConnections(prev=> prev.map(c=> c.id === id ? {...c, messages: msgs.map(m=>({
        id: m.id,
        content: m.content,
        direction: m.direction,
        timestamp: new Date(m.timestamp)
      }))} : c));
    } catch (error) {
      console.error('Ошибка загрузки сообщений')
    }
  }

  // удаление сесси

  // Добавление новой сессии
  const addConnection = async newConn => {
    const conn = {
      id: uuidv4(),
      ...newConn,
      status: 'disconnected',
      messages: [],
      createdAt: new Date()
    };
    setConnections(prev => [...prev, conn]);
    setActiveConnectionId(conn.id);
    setShowConnectionForm(false);

    try {
      await createSessionOnServer(conn);
      if (conn.autoConnect) {
        setTimeout(() => connect(conn.id), 300);
      }
    } catch {
      enqueueSnackbar('Не удалось сохранить сессию на сервере', { variant: 'error' });
    }
  };

  // Подключение к WS
  const connect = useCallback(async connectionId => {
    const conn = connections.find(c => c.id === connectionId);
    if (!conn) return;

    setIsConnecting(true);
    try {
      const ws = new WebSocket(conn.url, conn.protocols);
      setConnections(prev =>
        prev.map(c => c.id === connectionId ? { ...c, ws, status: 'connecting' } : c)
      );

      ws.onopen = () => {
        setConnections(prev =>
          prev.map(c => c.id === connectionId ? { ...c, status: 'connected' } : c)
        );
        setIsConnecting(false);
        enqueueSnackbar('WebSocket connected', { variant: 'success' });
      };

      ws.onmessage = async event => {
        const message = { id: uuidv4(), content: event.data, direction: 'INCOMING', timestamp: new Date() };
        try { await logMessageOnServer(connectionId, 'INCOMING', event.data); } catch {}
        setConnections(prev =>
          prev.map(c => c.id === connectionId ? { ...c, messages: [...c.messages, message] } : c)
        );
      };

      ws.onerror = error => {
        enqueueSnackbar(`WebSocket error: ${error.message}`, { variant: 'error' });
        setIsConnecting(false);
      };

      ws.onclose = async event => {
        setConnections(prev =>
          prev.map(c => c.id === connectionId ? { ...c, status: 'disconnected' } : c)
        );
        enqueueSnackbar(`WebSocket closed: ${event.reason || 'no reason'}`, { variant: 'info' });
        try { await closeSessionOnServer(connectionId); } catch {}
      };
    } catch (error) {
      enqueueSnackbar(`Connection failed: ${error.message}`, { variant: 'error' });
      setIsConnecting(false);
    }
  }, [connections, enqueueSnackbar]);

  // Отправка сообщения
  const onSendMessage = async ({ connectionId, content }) => {
    const conn = connections.find(c => c.id === connectionId);
    if (!conn?.ws || conn.ws.readyState !== WebSocket.OPEN) return;

    conn.ws.send(content);
    try { await logMessageOnServer(connectionId, 'OUTGOING', content); } catch {}
    const message = { id: uuidv4(), content, direction: 'OUTGOING', timestamp: new Date() };
    setConnections(prev =>
      prev.map(c => c.id === connectionId ? { ...c, messages: [...c.messages, message] } : c)
    );
  };

  // Отключение и удаление
  const disconnect = useCallback(connectionId => {
    const conn = connections.find(c => c.id === connectionId);
    conn?.ws?.close();
  }, [connections]);

 // удаление сессии
 const removeConnection = async (id) => {
   // сначала попросим сервер удалить
   try {
     await axios.delete(`/api/websocket/history/${id}`);
   } catch (err) {
     console.error('Delete session failed', err);
     enqueueSnackbar('Не удалось удалить сессию на сервере', { variant: 'error' });
     return;
   }
   // затем локально удаляем
   const conn = connections.find(c => c.id === id);
   if (conn?.status === 'connected') conn.ws.close();
   setConnections(prev => prev.filter(x => x.id !== id));
   if (activeConnectionId === id) setActiveConnectionId(null);
 };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Заголовок и кнопка */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 1 }}>
        <Typography variant="h6">
          WebSocket Client&nbsp;
          <Chip
            label={`${connections.filter(c => c.status === 'connected').length} active`}
            size="small"
            color="info"
          />
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowConnectionForm(true)}>
          Новое соединение
        </Button>
      </Box>

      {/* Форма создания */}
      <Collapse in={showConnectionForm}>
        <ConnectionForm
          onSubmit={addConnection}
          onCancel={() => setShowConnectionForm(false)}
          history={connections /* можно показывать прошлые здесь */}
        />
      </Collapse>

      {/* Если нет ни одной сессии */}
      {!connections.length && (
        <EmptyState
          onCreateConnection={() => setShowConnectionForm(true)}
          connectionHistory={connections}
        />
      )}

      {/* Список сессий + панель */}
      {!!connections.length && (
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', pl: 1 }}>
          <ConnectionList
            connections={connections}
            activeConnectionId={activeConnectionId}
            onSelect={selectConnection}
            onRemove={removeConnection}
            onCreateConnection={() => setShowConnectionForm(true)}
          />
          {activeConn && (
            <ConnectionPanel
              connection={activeConn}
              onConnect={connect}
              onDisconnect={disconnect}
              onUpdate={upd => setConnections(prev => prev.map(c => c.id === upd.id ? upd : c))}
              onRemove={removeConnection}
              onSendMessage={onSendMessage}
              isConnecting={isConnecting}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default WebSocketClient;
