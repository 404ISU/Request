// pages/Home.js

import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      {/* Герой-секция */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          HTTP
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: '600px', margin: '0 auto' }}>
          Инструмент для тестирования серверных API. Отправляйте HTTP-запросы, сохраняйте историю и проверяйте результаты.
        </Typography>
        <Box mt={4}>
          <Button component={Link} to="/register" variant="contained" color="primary" size="large" sx={{ mr: 2 }}>
            Зарегистрироваться
          </Button>
          <Button component={Link} to="/login" variant="outlined" color="primary" size="large">
            Войти
          </Button>
        </Box>
      </Box>

      {/* Особенности инструмента */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Особенности нашего инструмента
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image="data:image/jpeg;base64,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"
                alt="API Testing"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Тестирование API
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Отправляйте GET, POST, PUT, DELETE запросы и получайте детальные ответы от сервера.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image="data:image/png;base64,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"
                alt="History"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Сохранение истории
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Просматривайте и повторяйте ранее отправленные запросы.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image="https://i.pinimg.com/736x/37/53/62/37536264b0dafde9904fe7946b8ebfff.jpg"
                alt="Headers"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Настройка заголовков
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Добавляйте и редактируйте заголовки запросов для точной настройки.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image="https://i.pinimg.com/736x/26/86/0e/26860e639ae8a30b6c73a6af5c125991.jpg"
                alt="Users"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Управление пользователями
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Создавайте организации, работников и управляйте ими через административную панель.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Как это работает */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Как это работает
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="150"
                image="https://i.pinimg.com/736x/fa/ef/15/faef15cc304d627ef1539e27df580094.jpg"
                alt="Step 1"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Шаг 1: Регистрация
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Зарегистрируйтесь на сайте, чтобы получить доступ ко всем функциям.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="150"
                image="https://i.pinimg.com/736x/5a/e3/79/5ae37932839d85465cbadd761433b0cf.jpg"
                alt="Step 2"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Шаг 2: Создание запроса
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Выберите метод (GET, POST, PUT, DELETE), настройте параметры и отправьте запрос.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="150"
                image="https://i.pinimg.com/736x/63/38/d1/6338d105451b4556a25dbbc49e89b784.jpg"
                alt="Step 3"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Шаг 3: Анализ ответа
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Получите детальный ответ от сервера и проанализируйте его.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="150"
                image="https://i.pinimg.com/736x/5f/92/ad/5f92ad60821ede3b45c1641865547223.jpg"
                alt="Step 4"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Шаг 4: История запросов
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Просматривайте и повторяйте ранее отправленные запросы.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Преимущества */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Почему стоит выбрать нас?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image="https://cdn3.mbschool.ru/mbschool/articles/chesnokov/1.png"
                alt="Easy to Use"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Простота использования
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Интуитивно понятный интерфейс для быстрого тестирования API.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image="https://i.pinimg.com/736x/0e/c2/94/0ec294ac6fc6e583ad648f9aefd01666.jpg"
                alt="Powerful Features"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Мощные возможности
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Поддержка всех типов HTTP-запросов, заголовков, параметров и тела запроса.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image="https://i.pinimg.com/736x/e0/e2/be/e0e2bece87c7fd60aebed2c94dc3a761.jpg"
                alt="Security"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Безопасность
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Надежная защита данных и аутентификация пользователей.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
              <CardMedia
                component="img"
                height="100"
                image="https://i.pinimg.com/736x/5a/c2/7e/5ac27e8e0d2c75dbb4edcfad3a2b3ba2.jpg"
                alt="Free Access"
                sx={{ mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Бесплатный доступ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Все функции доступны бесплатно для зарегистрированных пользователей.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Призыв к действию */}
      <Box textAlign="center" mt={6} mb={8}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Хотите начать тестировать API?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Зарегистрируйтесь или войдите, чтобы получить доступ ко всем функциям.
        </Typography>
        <Button component={Link} to="/register" variant="contained" color="primary" size="large" sx={{ mr: 2 }}>
          Зарегистрироваться
        </Button>
        <Button component={Link} to="/login" variant="outlined" color="primary" size="large">
          Войти
        </Button>
      </Box>
    </Container>
  );
};

export default Home;