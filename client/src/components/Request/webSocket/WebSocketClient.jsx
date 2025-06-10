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
  const selectConnection = async(id) => {
    setActiveConnectionId(id);
    // загрузить сообщение при переключения
    try {
      const {data: msgs} = await axios.get(`/api/websocket/history/${id}/messages`);
      setConnections(prev => prev.map(c => c.id === id ? {
        ...c,
        messages: msgs.map(m => ({
          id: m.id,
          content: m.content,
          direction: m.direction,
          timestamp: new Date(m.timestamp)
        }))
      } : c));
    } catch (error) {
      console.error('Ошибка загрузки сообщений');
    }
  };

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
      // Валидация URL
      console.log('Validating URL:', conn.url);
      
      // Проверяем и очищаем URL
      let cleanUrl = conn.url.trim();
      
      // Если URL начинается с @, удаляем его
      if (cleanUrl.startsWith('@')) {
        cleanUrl = cleanUrl.substring(1);
      }
      
      if (!cleanUrl.startsWith('ws://') && !cleanUrl.startsWith('wss://')) {
        console.error('Invalid URL format:', cleanUrl);
        throw new Error('URL must start with ws:// or wss://');
      }

      console.log('Using WebSocket URL:', cleanUrl);

      // Создаем WebSocket с заголовками и опциями
      const wsOptions = {
        rejectUnauthorized: false, // Allow self-signed certificates
        handshakeTimeout: 10000,   // 10 second timeout
        perMessageDeflate: false,  // Disable compression for better compatibility
        followRedirects: true,     // Follow redirects if any
        maxPayload: 1048576        // 1MB max payload
      };
      
      // Добавляем базовые заголовки
      const defaultHeaders = {
        'Origin': window.location.origin,
        'User-Agent': navigator.userAgent,
        'Connection': 'Upgrade',
        'Upgrade': 'websocket'
      };

      // Объединяем с пользовательскими заголовками
      const headers = { ...defaultHeaders, ...conn.headers };

      // Определяем протоколы
      const protocols = conn.protocols || [];

      console.log('Attempting WebSocket connection with:', {
        url: cleanUrl,
        protocols,
        headers,
        options: wsOptions
      });

      // Создаем WebSocket с протоколами и заголовками
      const ws = new WebSocket(cleanUrl, protocols, wsOptions);

      // Сохраняем WebSocket в состоянии соединения
      setConnections(prev =>
        prev.map(c => c.id === connectionId ? { ...c, ws, status: 'connecting' } : c)
      );

      // Устанавливаем таймаут для подключения
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          const errorMsg = {
            id: uuidv4(),
            content: 'Connection timeout after 10 seconds',
            type: 'error',
            direction: 'ERROR',
            timestamp: new Date()
          };
          setConnections(prev =>
            prev.map(c => c.id === connectionId ? {
              ...c,
              status: 'disconnected',
              messages: [...c.messages, errorMsg]
            } : c)
          );
          enqueueSnackbar('Connection timeout', { variant: 'error' });
        }
      }, 10000);

      // Добавляем обработчик для успешного подключения
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket Connection Established:', {
          url: conn.url,
          protocols,
          headers
        });
        setConnections(prev =>
          prev.map(c => c.id === connectionId ? { ...c, status: 'connected' } : c)
        );
        setIsConnecting(false);
        enqueueSnackbar('WebSocket connected', { variant: 'success' });
      };

      ws.onmessage = async event => {
        let content = event.data;
        let type = 'text';
        
        // Пытаемся определить тип сообщения
        try {
          const parsed = JSON.parse(content);
          content = JSON.stringify(parsed, null, 2);
          type = 'json';
        } catch {
          if (content.startsWith('<')) {
            type = 'xml';
          }
        }

        const message = {
          id: uuidv4(),
          content,
          type,
          direction: 'INCOMING',
          timestamp: new Date()
        };

        try {
          await logMessageOnServer(connectionId, 'INCOMING', content);
        } catch (err) {
          console.error('Failed to log message:', err);
        }

        setConnections(prev =>
          prev.map(c => c.id === connectionId ? {
            ...c,
            messages: [...c.messages, message]
          } : c)
        );
      };

      ws.onerror = error => {
        clearTimeout(connectionTimeout);
        let errorMessage = 'Unknown error';
        
        // Пытаемся получить более подробную информацию об ошибке
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && error.message) {
          errorMessage = error.message;
        }

        // Проверяем состояние соединения
        const readyStateMap = {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED'
        };

        // Добавляем контекст к ошибке
        if (errorMessage.includes('failed')) {
          errorMessage += ` - Connection state: ${readyStateMap[ws.readyState]}`;
          errorMessage += ' - Possible reasons: server is not available, CORS issues, or invalid URL';
        }

        // Проверяем наличие CORS ошибки
        if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
          errorMessage = 'CORS error: The server does not allow connections from this origin. Try using a CORS proxy or ensure the server allows your origin.';
        }

        // Добавляем проверку SSL/TLS ошибок
        if (errorMessage.includes('SSL') || errorMessage.includes('TLS') || errorMessage.includes('certificate')) {
          errorMessage = 'SSL/TLS error: There might be issues with the server certificate or SSL configuration.';
        }

        // Добавляем проверку на недоступность сервера
        if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
          errorMessage = 'Server is not available or unreachable. Please check the URL and server status.';
        }

        // Проверяем версию протокола
        if (errorMessage.includes('protocol')) {
          errorMessage = 'Protocol error: The server might not support the specified WebSocket protocol version.';
        }

        console.error('WebSocket Error Details:', {
          error,
          readyState: readyStateMap[ws.readyState],
          url: conn.url,
          protocols,
          headers,
          timestamp: new Date().toISOString()
        });

        enqueueSnackbar(`WebSocket error: ${errorMessage}`, { variant: 'error' });
        setIsConnecting(false);
        
        // Добавляем сообщение об ошибке в историю
        const errorMsg = {
          id: uuidv4(),
          content: errorMessage,
          type: 'error',
          direction: 'ERROR',
          timestamp: new Date()
        };
        
        setConnections(prev =>
          prev.map(c => c.id === connectionId ? {
            ...c,
            status: 'disconnected',
            messages: [...c.messages, errorMsg]
          } : c)
        );
      };

      ws.onclose = async event => {
        clearTimeout(connectionTimeout);
        setConnections(prev =>
          prev.map(c => c.id === connectionId ? { ...c, status: 'disconnected' } : c)
        );
        
        let closeMessage = event.reason || 'Connection closed';
        const closeCode = event.code;

        // Добавляем информацию о коде закрытия
        if (closeCode) {
          closeMessage += ` (Code: ${closeCode})`;
          // Добавляем описание кода закрытия
          switch (closeCode) {
            case 1000:
              closeMessage += ' - Normal closure';
              break;
            case 1001:
              closeMessage += ' - Going away';
              break;
            case 1002:
              closeMessage += ' - Protocol error';
              break;
            case 1003:
              closeMessage += ' - Unsupported data';
              break;
            case 1005:
              closeMessage += ' - No status received';
              break;
            case 1006:
              closeMessage += ' - Abnormal closure (Server might be down or unreachable)';
              break;
            case 1007:
              closeMessage += ' - Invalid frame payload data';
              break;
            case 1008:
              closeMessage += ' - Policy violation';
              break;
            case 1009:
              closeMessage += ' - Message too big';
              break;
            case 1010:
              closeMessage += ' - Missing extension';
              break;
            case 1011:
              closeMessage += ' - Internal error';
              break;
            case 1012:
              closeMessage += ' - Service restart';
              break;
            case 1013:
              closeMessage += ' - Try again later';
              break;
            case 1014:
              closeMessage += ' - Bad gateway';
              break;
            case 1015:
              closeMessage += ' - TLS handshake failed';
              break;
          }
        }

        console.log('WebSocket Close Details:', {
          code: closeCode,
          reason: event.reason,
          wasClean: event.wasClean,
          url: conn.url,
          readyState: ws.readyState
        });

        enqueueSnackbar(`WebSocket closed: ${closeMessage}`, { variant: 'info' });

        // Добавляем сообщение о закрытии в историю
        const closeMsg = {
          id: uuidv4(),
          content: closeMessage,
          type: 'system',
          direction: 'SYSTEM',
          timestamp: new Date()
        };
        
        setConnections(prev =>
          prev.map(c => c.id === connectionId ? {
            ...c,
            messages: [...c.messages, closeMsg]
          } : c)
        );

        try {
          await closeSessionOnServer(connectionId);
        } catch (err) {
          console.error('Failed to close session:', err);
        }
      };
    } catch (error) {
      setIsConnecting(false);
      const errorMessage = error.message || 'Failed to connect';
      enqueueSnackbar(`Connection failed: ${errorMessage}`, { variant: 'error' });
      
      // Добавляем сообщение об ошибке в историю
      const errorMsg = {
        id: uuidv4(),
        content: errorMessage,
        type: 'error',
        direction: 'ERROR',
        timestamp: new Date()
      };
      
      setConnections(prev =>
        prev.map(c => c.id === connectionId ? {
          ...c,
          status: 'disconnected',
          messages: [...c.messages, errorMsg]
        } : c)
      );
    }
  }, [connections, enqueueSnackbar]);

  // Отправка сообщения
  const onSendMessage = async ({ connectionId, content }) => {
    const conn = connections.find(c => c.id === connectionId);
    if (!conn?.ws || conn.ws.readyState !== WebSocket.OPEN) {
      enqueueSnackbar('WebSocket is not connected', { variant: 'error' });
      return;
    }

    try {
      // Пытаемся определить тип сообщения
      let type = 'text';
      try {
        const parsed = JSON.parse(content);
        content = JSON.stringify(parsed);
        type = 'json';
      } catch {
        if (content.startsWith('<')) {
          type = 'xml';
        }
      }

      conn.ws.send(content);
      
      try {
        await logMessageOnServer(connectionId, 'OUTGOING', content);
      } catch (err) {
        console.error('Failed to log message:', err);
      }

      const message = {
        id: uuidv4(),
        content,
        type,
        direction: 'OUTGOING',
        timestamp: new Date()
      };

      setConnections(prev =>
        prev.map(c => c.id === connectionId ? {
          ...c,
          messages: [...c.messages, message]
        } : c)
      );
    } catch (error) {
      enqueueSnackbar(`Failed to send message: ${error.message}`, { variant: 'error' });
    }
  };

  // Отключение и удаление
  const disconnect = useCallback(connectionId => {
    const conn = connections.find(c => c.id === connectionId);
    if (!conn) return;

    console.log('Disconnecting WebSocket:', {
      connectionId,
      status: conn.status,
      hasWebSocket: !!conn.ws
    });

    if (conn.ws) {
      try {
        // Закрываем соединение с кодом 1000 (нормальное закрытие)
        conn.ws.close(1000, 'User disconnected');
        
        // Обновляем состояние соединения
        setConnections(prev =>
          prev.map(c => c.id === connectionId ? {
            ...c,
            status: 'disconnected',
            ws: null
          } : c)
        );

        enqueueSnackbar('WebSocket disconnected', { variant: 'info' });
      } catch (error) {
        console.error('Error during disconnect:', error);
        enqueueSnackbar('Error disconnecting WebSocket', { variant: 'error' });
      }
    } else {
      console.warn('No WebSocket instance found for connection:', connectionId);
      enqueueSnackbar('No active connection to disconnect', { variant: 'warning' });
    }
  }, [connections, enqueueSnackbar]);

  // удаление сессии
  const removeConnection = async (id) => {
    // Сначала отключаем соединение, если оно активно
    const conn = connections.find(c => c.id === id);
    if (conn?.status === 'connected') {
      await disconnect(id);
    }

    // затем удаляем на сервере
    try {
      await axios.delete(`/api/websocket/history/${id}`);
    } catch (err) {
      console.error('Delete session failed', err);
      enqueueSnackbar('Не удалось удалить сессию на сервере', { variant: 'error' });
      return;
    }

    // затем локально удаляем
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
