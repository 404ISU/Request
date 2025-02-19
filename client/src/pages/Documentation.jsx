import React from 'react';
import {
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Создаем кастомную тему с бело-синими оттенками
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Основной синий цвет
    },
    secondary: {
      main: '#ffffff', // Белый цвет для акцентов
    },
    background: {
      default: '#f5f5f5', // Светло-серый фон для страницы
      paper: '#ffffff', // Белый фон для карточек
    },
    text: {
      primary: '#1976d2', // Синий цвет для текста
      secondary: '#000000', // Черный цвет для вторичного текста
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#1976d2', // Синий цвет для заголовков
    },
    h5: {
      fontWeight: 600,
      color: '#1976d2', // Синий цвет для подзаголовков
    },
    body1: {
      color: '#000000', // Черный цвет для основного текста
    },
  },
});

const Documentation = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ThemeProvider theme={customTheme}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Документация HTTP-клиента
          </Typography>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="primary">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        {/* Введение */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>
            Введение
          </Typography>
          <Typography variant="body1" paragraph>
            Этот инструмент позволяет отправлять HTTP-запросы и анализировать ответы. Вы можете настроить URL, метод, заголовки, тело запроса, параметры запроса, авторизацию и многое другое. Это идеальный инструмент для тестирования API и отладки запросов.
          </Typography>
        </Paper>

        {/* Основные функции */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>
            Основные функции
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Отправка HTTP-запросов"
                secondary="Поддерживаются все основные методы: GET, POST, PUT, DELETE, PATCH и другие."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Настройка заголовков"
                secondary="Вы можете добавлять и редактировать заголовки запроса в формате JSON."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Настройка тела запроса"
                secondary="Поддержка JSON, текста, формы и других форматов тела запроса."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Параметры запроса"
                secondary="Добавляйте параметры запроса (query parameters) для GET-запросов."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Авторизация"
                secondary="Поддержка Bearer Token и Basic Auth для защищенных запросов."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="История запросов"
                secondary="Все отправленные запросы сохраняются в истории, чтобы вы могли легко их повторить."
              />
            </ListItem>
          </List>
        </Paper>

        {/* Примеры использования */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>
            Примеры использования
          </Typography>

          {/* Пример GET-запроса */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Пример GET-запроса</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                <strong>Шаг 1:</strong> Введите URL API в поле "API URL". Например:
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  https://jsonplaceholder.typicode.com/posts
                </pre>
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Шаг 2:</strong> Выберите метод <strong>GET</strong> из выпадающего списка.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Шаг 3:</strong> Нажмите кнопку <strong>"Отправить запрос"</strong>.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Результат:</strong> Вы получите ответ от сервера в формате JSON.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Пример POST-запроса */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Пример POST-запроса</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                <strong>Шаг 1:</strong> Введите URL API в поле "API URL". Например:
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  https://jsonplaceholder.typicode.com/posts
                </pre>
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Шаг 2:</strong> Выберите метод <strong>POST</strong> из выпадающего списка.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Шаг 3:</strong> Добавьте тело запроса в формате JSON. Например:
                <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  {`{
  "title": "foo",
  "body": "bar",
  "userId": 1
}`}
                </pre>
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Шаг 4:</strong> Нажмите кнопку <strong>"Отправить запрос"</strong>.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Результат:</strong> Вы получите ответ от сервера с созданным ресурсом.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Дополнительные настройки */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>
            Дополнительные настройки
          </Typography>
          <Typography variant="body1" paragraph>
            В разделе <strong>"Дополнительные настройки"</strong> вы можете:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Добавлять параметры запроса (query parameters)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Настраивать авторизацию (Bearer Token или Basic Auth)." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Использовать переменные окружения для динамической подстановки значений." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Добавлять утверждения (assertions) для автоматической проверки ответов." />
            </ListItem>
          </List>
        </Paper>

        {/* История запросов */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>
            История запросов
          </Typography>
          <Typography variant="body1" paragraph>
            Все отправленные запросы сохраняются в истории. Вы можете:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Просматривать историю запросов." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Повторно использовать любой запрос, нажав на него в списке истории." />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Documentation;