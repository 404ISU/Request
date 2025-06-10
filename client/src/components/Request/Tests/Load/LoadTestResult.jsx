// src/components/Tests/Load/LoadTestResult.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const formatLatency = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

const StatCard = ({ title, value, subtitle, color }) => (
  <Card>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" color={color}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function LoadTestResult({ testId }) {
  const { data: test, isLoading, error } = useQuery({
    queryKey: ['loadTest', testId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/tests/load/${testId}/status`, {
        withCredentials: true
      });
      return data;
    },
    refetchInterval: 5000 // Обновляем каждые 5 секунд
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Ошибка загрузки результатов: {error.message}
      </Alert>
    );
  }

  if (!test?.results) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Тест еще не запущен или выполняется
      </Alert>
    );
  }

  const { results } = test;
  const successRate = ((results.success / results.totalRequests) * 100).toFixed(1);
  const failureRate = ((results.failure / results.totalRequests) * 100).toFixed(1);

  // Подготовка данных для графика
  const latencyData = results.latencies.map((latency, index) => ({
    request: index + 1,
    latency
  }));

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Результаты теста: {test.name}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Основные метрики */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего запросов"
            value={formatNumber(results.totalRequests)}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Успешных"
            value={`${successRate}%`}
            subtitle={`${formatNumber(results.success)} запросов`}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ошибок"
            value={`${failureRate}%`}
            subtitle={`${formatNumber(results.failure)} запросов`}
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Среднее время"
            value={formatLatency(results.averageLatency)}
            color="info.main"
          />
        </Grid>

        {/* График латентности */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3, height: 400 }}>
            <Typography variant="subtitle1" gutterBottom>
              График времени ответа
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="request"
                  label={{ value: 'Номер запроса', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Время (мс)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value) => [`${value}мс`, 'Время ответа']}
                  labelFormatter={(label) => `Запрос #${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#8884d8"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Перцентили */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Распределение времени ответа
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  P50 (медиана)
                </Typography>
                <Typography variant="h6">
                  {formatLatency(results.percentiles.p50)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  P90
                </Typography>
                <Typography variant="h6">
                  {formatLatency(results.percentiles.p90)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  P95
                </Typography>
                <Typography variant="h6">
                  {formatLatency(results.percentiles.p95)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  P99
                </Typography>
                <Typography variant="h6">
                  {formatLatency(results.percentiles.p99)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Статус коды */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Распределение статус кодов
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(results.statusCodes).map(([code, count]) => (
                <Grid item xs={6} sm={4} md={2} key={code}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="h6"
                      color={
                        code >= 200 && code < 300
                          ? 'success.main'
                          : code >= 300 && code < 400
                          ? 'info.main'
                          : code >= 400 && code < 500
                          ? 'warning.main'
                          : 'error.main'
                      }
                    >
                      {code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(count)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
