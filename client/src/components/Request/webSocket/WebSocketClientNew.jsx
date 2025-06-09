import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton, useSnackbar } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { Editor } from '@monaco-editor/react';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import { logMessageOnServer, closeSessionOnServer } from '../../../services/websocketService';

export function WebSocketClientNew() {
  const [connections, setConnections] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Создание нового подключения
  const createConnection = useCallback(() => {
    const newConnection = {
      id: uuidv4(),
      url: '',
      headers: {},
      status: 'disconnected',
      messages: [],
      ws: null
    };
    setConnections(prev => [...prev, newConnection]);
  }, []);

  // Подключение к WS
  const connect = useCallback(async connectionId => {
    const conn = connections.find(c => c.id === connectionId);
    if (!conn) return;

    setIsConnecting(true);
    try {
      // Валидация URL
      if (!conn.url.startsWith('ws://') && !conn.url.startsWith('wss://')) {
        throw new Error('URL must start with ws:// or wss://');
      }

      // Создаем WebSocket с заголовками
      const ws = new WebSocket(conn.url, conn.protocols);
      
      // Добавляем заголовки через протоколы
      if (Object.keys(conn.headers || {}).length > 0) {
        try {
          ws.protocol = JSON.stringify(conn.headers);
        } catch (err) {
          console.warn('Failed to set headers:', err);
        }
      }

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

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
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

        // Добавляем контекст к ошибке
        if (errorMessage.includes('failed')) {
          errorMessage += ' - Possible reasons: server is not available, CORS issues, or invalid URL';
        }

        // Проверяем наличие CORS ошибки
        if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
          errorMessage = 'CORS error: The server does not allow connections from this origin. Try using a CORS proxy or ensure the server allows your origin.';
        }

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
              closeMessage += ' - Abnormal closure';
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

  // Отключение от WS
  const disconnect = useCallback(connectionId => {
    const conn = connections.find(c => c.id === connectionId);
    if (conn?.ws) {
      conn.ws.close();
    }
  }, [connections]);

  // Удаление подключения
  const removeConnection = useCallback(connectionId => {
    const conn = connections.find(c => c.id === connectionId);
    if (conn?.ws) {
      conn.ws.close();
    }
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  }, [connections]);

  // Обновление URL
  const updateUrl = useCallback((connectionId, url) => {
    setConnections(prev =>
      prev.map(c => c.id === connectionId ? { ...c, url } : c)
    );
  }, []);

  // Обновление заголовков
  const updateHeaders = useCallback((connectionId, headers) => {
    setConnections(prev =>
      prev.map(c => c.id === connectionId ? { ...c, headers } : c)
    );
  }, []);

  // Отправка сообщения
  const sendMessage = useCallback(async (connectionId, content) => {
    const conn = connections.find(c => c.id === connectionId);
    if (!conn?.ws || conn.ws.readyState !== WebSocket.OPEN) {
      enqueueSnackbar('WebSocket is not connected', { variant: 'error' });
      return;
    }

    try {
      let messageToSend = content;
      let type = 'text';

      // Пытаемся определить тип сообщения
      try {
        const parsed = JSON.parse(content);
        messageToSend = JSON.stringify(parsed);
        type = 'json';
      } catch {
        if (content.startsWith('<')) {
          type = 'xml';
        }
      }

      conn.ws.send(messageToSend);

      const message = {
        id: uuidv4(),
        content,
        type,
        direction: 'OUTGOING',
        timestamp: new Date()
      };

      try {
        await logMessageOnServer(connectionId, 'OUTGOING', content);
      } catch (err) {
        console.error('Failed to log message:', err);
      }

      setConnections(prev =>
        prev.map(c => c.id === connectionId ? {
          ...c,
          messages: [...c.messages, message]
        } : c)
      );
    } catch (error) {
      enqueueSnackbar(`Failed to send message: ${error.message}`, { variant: 'error' });
    }
  }, [connections, enqueueSnackbar]);

  return (
    <Box sx={{ p: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={createConnection}
        sx={{ mb: 2 }}
      >
        New Connection
      </Button>

      {connections.map(conn => (
        <Paper key={conn.id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              label="WebSocket URL"
              value={conn.url}
              onChange={e => updateUrl(conn.id, e.target.value)}
              placeholder="wss://example.com/ws"
              sx={{ mr: 2 }}
            />
            <Button
              variant="contained"
              color={conn.status === 'connected' ? 'error' : 'primary'}
              onClick={() => conn.status === 'connected' ? disconnect(conn.id) : connect(conn.id)}
              disabled={isConnecting}
            >
              {conn.status === 'connected' ? 'Disconnect' : 'Connect'}
            </Button>
            <IconButton
              onClick={() => removeConnection(conn.id)}
              sx={{ ml: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Headers (JSON)</Typography>
            <Editor
              height="100px"
              defaultLanguage="json"
              value={JSON.stringify(conn.headers, null, 2)}
              onChange={value => {
                try {
                  const headers = JSON.parse(value);
                  updateHeaders(conn.id, headers);
                } catch (err) {
                  // Ignore invalid JSON
                }
              }}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Message</Typography>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter message to send..."
                onKeyPress={e => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    sendMessage(conn.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                sx={{ mr: 1 }}
              />
              <IconButton
                color="primary"
                onClick={e => {
                  const input = e.target.previousSibling;
                  sendMessage(conn.id, input.value);
                  input.value = '';
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Messages</Typography>
            <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {conn.messages.map(msg => (
                <Paper
                  key={msg.id}
                  sx={{
                    p: 1,
                    mb: 1,
                    backgroundColor: msg.direction === 'INCOMING' ? '#f5f5f5' : '#e3f2fd',
                    borderLeft: `4px solid ${
                      msg.direction === 'INCOMING' ? '#2196f3' :
                      msg.direction === 'OUTGOING' ? '#4caf50' :
                      msg.direction === 'ERROR' ? '#f44336' :
                      '#9e9e9e'
                    }`
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {msg.direction} - {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                  {msg.type === 'json' || msg.type === 'xml' ? (
                    <Editor
                      height="100px"
                      defaultLanguage={msg.type}
                      value={msg.content}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14
                      }}
                    />
                  ) : (
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
} 