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
  Divider,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack
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
  LibraryBooks,
  CheckCircle,
  BugReport,
  Speed,
  CollectionsBookmark,
  WifiTethering,
  Assessment
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
            API Tester
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Мощный инструмент для тестирования и отладки API
          </Typography>
        </Box>

        {/* Основные возможности */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              icon: <Http />,
              title: 'HTTP Запросы',
              description: 'Поддержка всех основных HTTP методов: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, TRACE'
            },
            {
              icon: <Security />,
              title: 'Аутентификация',
              description: 'Bearer Token и Basic Auth для безопасного доступа к API'
            },
            {
              icon: <CheckCircle />,
              title: 'Автоматические проверки',
              description: 'Проверка статуса, тела ответа, заголовков и времени ответа'
            },
            {
              icon: <History />,
              title: 'История запросов',
              description: 'Поиск, фильтрация и повторное использование предыдущих запросов'
            },
            {
              icon: <CollectionsBookmark />,
              title: 'Коллекции',
              description: 'Организация запросов в коллекции и папки'
            },
            {
              icon: <WifiTethering />,
              title: 'WebSocket',
              description: 'Тестирование WebSocket соединений в реальном времени'
            },
            {
              icon: <Assessment />,
              title: 'Нагрузочное тестирование',
              description: 'Проверка производительности API под нагрузкой'
            },
            {
              icon: <BugReport />,
              title: 'Отладка',
              description: 'Детальный анализ ответов и ошибок'
            }
          ].map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
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
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Пошаговое руководство */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Send sx={{ mr: 2 }} /> Пошаговое руководство
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="1. Создание запроса" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon><Code /></ListItemIcon>
                      <ListItemText 
                        primary="Введите URL API"
                        secondary="Поддерживаются переменные окружения в формате {{variable}}"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Http /></ListItemIcon>
                      <ListItemText 
                        primary="Выберите метод запроса"
                        secondary="GET, POST, PUT, DELETE и другие"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Settings /></ListItemIcon>
                      <ListItemText 
                        primary="Настройте параметры"
                        secondary="Заголовки, тело запроса, параметры URL"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="2. Расширенные настройки" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon><Security /></ListItemIcon>
                      <ListItemText 
                        primary="Аутентификация"
                        secondary="Bearer Token или Basic Auth"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle /></ListItemIcon>
                      <ListItemText 
                        primary="Проверки"
                        secondary="Настройка автоматических проверок ответа"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CollectionsBookmark /></ListItemIcon>
                      <ListItemText 
                        primary="Сохранение"
                        secondary="Сохранение запроса в коллекцию"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Примеры использования */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PostAdd sx={{ mr: 2 }} /> Примеры использования
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Пример GET запроса с проверками</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>URL и метод:</Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    GET https://api.example.com/users
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Заголовки:</Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    {`{
  "Authorization": "Bearer your-token",
  "Content-Type": "application/json"
}`}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Проверки:</Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    {`[
  {
    "type": "status",
    "operator": "равно",
    "expected": "200"
  },
  {
    "type": "body",
    "property": "users.length",
    "operator": "больше чем",
    "expected": "0"
  }
]`}
                  </Box>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Пример POST запроса с телом</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>URL и метод:</Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    POST https://api.example.com/users
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Тело запроса:</Typography>
                  <Box component="pre" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    {`{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}`}
                  </Box>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Советы и рекомендации */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Settings sx={{ mr: 2 }} /> Советы и рекомендации
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Работа с коллекциями" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon><CollectionsBookmark /></ListItemIcon>
                      <ListItemText 
                        primary="Организуйте запросы"
                        secondary="Создавайте коллекции и папки для группировки связанных запросов"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><History /></ListItemIcon>
                      <ListItemText 
                        primary="Используйте историю"
                        secondary="Повторно используйте успешные запросы из истории"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Эффективное тестирование" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircle /></ListItemIcon>
                      <ListItemText 
                        primary="Автоматические проверки"
                        secondary="Настраивайте проверки для автоматической валидации ответов"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Speed /></ListItemIcon>
                      <ListItemText 
                        primary="Нагрузочное тестирование"
                        secondary="Используйте нагрузочное тестирование для проверки производительности"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Documentation;