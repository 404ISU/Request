// src/components/Tests/Load/LoadTestResult.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Divider
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
import axios from 'axios';

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
  const [status, setStatus] = useState('pending');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!testId) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/tests/load/${testId}/status`);
        if (data.results) {
          setResults(data.results);
          setStatus('completed');
          clearInterval(interval);
        } else {
          setStatus('running');
        }
      } catch (e) {
        setError('Ошибка при получении статуса теста');
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [testId]);

  if (!testId) {
    return (
      <Alert severity="info">
        Нажмите "Показать результат" у теста, чтобы увидеть детали.
      </Alert>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (status === 'running') {
    return (
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>Идет нагрузочное тестирование…</Typography>
      </Box>
    );
  }

  if (status === 'completed' && results) {
    const {
      totalRequests,
      success,
      failure,
      latencies,
      averageLatency
    } = results;

    const successRate = ((success / totalRequests) * 100).toFixed(1);
    const failureRate = ((failure / totalRequests) * 100).toFixed(1);

    // Подготовка данных для графика
    const latencyData = latencies.map((latency, index) => ({
      request: index + 1,
      latency
    }));

    // Расчет перцентилей
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)];
    const p90 = sortedLatencies[Math.floor(sortedLatencies.length * 0.9)];
    const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
    const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)];

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Результаты нагрузочного теста
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Всего запросов"
              value={formatNumber(totalRequests)}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Успешных"
              value={`${successRate}%`}
              subtitle={`${formatNumber(success)} запросов`}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Ошибок"
              value={`${failureRate}%`}
              subtitle={`${formatNumber(failure)} запросов`}
              color="error.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Среднее время"
              value={formatLatency(averageLatency)}
              color="info.main"
            />
          </Grid>
        </Grid>

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
                {formatLatency(p50)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                P90
              </Typography>
              <Typography variant="h6">
                {formatLatency(p90)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                P95
              </Typography>
              <Typography variant="h6">
                {formatLatency(p95)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">
                P99
              </Typography>
              <Typography variant="h6">
                {formatLatency(p99)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, height: 400 }}>
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
      </Box>
    );
  }

  return (
    <Alert severity="info">
      Результаты теста пока не готовы.
    </Alert>
  );
}
