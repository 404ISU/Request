import React from 'react';
import {
  Grid,
  Container,
  Typography,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Link,
  useTheme,
  ThemeProvider,
  createTheme,
  IconButton,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ContentCopy,
  ExpandMore,
  Send,
  Code,
  Security,
  History,
  Settings,
  LightMode,
  DarkMode,
  Api,
  Http,
  PostAdd,
  LibraryBooks
} from '@mui/icons-material';

// Современная тема с градиентами и анимациями
const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      gradient: 'linear-gradient(45deg, #2196f3 0%, #1976d2 100%)'
    },
    secondary: {
      main: '#ff4081'
    },
    background: {
      default: '#f8f9ff',
      paper: '#ffffff'
    },
    text: {
      primary: '#2d3436',
      secondary: '#636e72'
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h4: {
      fontWeight: 600,
      color: '#2d3436'
    },
    body1: {
      lineHeight: 1.6
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px!important',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)!important',
          transition: 'transform 0.2s, box-shadow 0.2s!important',
          '&:hover': {
            transform: 'translateY(-2px)'
          }
        }
      }
    }
  }
});

const Documentation = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ThemeProvider theme={modernTheme}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Шапка документации */}
        <Box sx={{
          textAlign: 'center',
          mb: 6,
          background: darkMode ? 'linear-gradient(45deg, #0f172a, #1e293b)' : modernTheme.palette.primary.gradient,
          color: '#fff',
          p: 4,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            transition: '500ms',
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 120,
            height: 120,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>
          
          <Typography variant="h3" gutterBottom sx={{ color: '#fff', mt: 2 }}>
            <LibraryBooks sx={{ fontSize: 48, verticalAlign: 'middle', mr: 2 }} />
            API Tester Docs
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Полное руководство по работе с инструментом тестирования API
          </Typography>
        </Box>

        {/* Быстрый старт */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Send color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4">Быстрый старт</Typography>
          </Box>
          
          <List dense>
            {[
              '1. Введите URL API в поле ввода',
              '2. Выберите метод запроса',
              '3. Настройте параметры (при необходимости)',
              '4. Нажмите "Отправить запрос"',
              '5. Анализируйте ответ в правой панели'
            ].map((text) => (
              <ListItem key={text}>
                <ListItemIcon>
                  <Code color="primary" />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Основные функции */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Settings color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4">Основные функции</Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              { 
                icon: <Http />,
                title: 'Поддержка методов',
                content: 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS'
              },
              {
                icon: <Security />,
                title: 'Авторизация',
                content: 'Bearer Token, Basic Auth, OAuth 2.0'
              },
              {
                icon: <Code />,
                title: 'Форматы данных',
                content: 'JSON, XML, FormData, Text, Binary'
              },
              {
                icon: <History />,
                title: 'История запросов',
                content: 'Автосохранение, поиск, повторная отправка'
              }
            ].map((feature) => (
              <Grid item xs={12} md={6} key={feature.title}>
                <Box sx={{
                  p: 3,
                  height: '100%',
                  border: `1px solid ${modernTheme.palette.divider}`,
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      background: modernTheme.palette.primary.gradient,
                      color: '#fff',
                      p: 1,
                      borderRadius: 1,
                      mr: 2
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6">{feature.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feature.content}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Примеры использования */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PostAdd color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4">Примеры использования</Typography>
          </Box>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Пример GET запроса</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="pre" sx={{
                p: 2,
                borderRadius: 1,
                background: '#f8f9ff',
                position: 'relative'
              }}>
                <IconButton size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
                {`GET https://api.example.com/data
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json`}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Пример POST запроса</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="pre" sx={{
                p: 2,
                borderRadius: 1,
                background: '#f8f9ff'
              }}>
                {`POST https://api.example.com/users
Body:
{
  "name": "John Doe",
  "email": "john@example.com"
}`}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Поддержка */}
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Нужна помощь?
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Обратитесь в нашу поддержку:
          </Typography>
          <Link href="mailto:support@apitest.com" color="primary">
            support@apitest.com
          </Link>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Documentation;