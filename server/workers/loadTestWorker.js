// workers/loadTestWorker.js
const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

// Подключаем модель (путь может меняться, у вас — '../models/LoadTest')
const LoadTest = require(path.join(__dirname, '../models/LoadTest'));

// Константы
const REQUEST_TIMEOUT = 30000; // 30 секунд таймаут для запроса
const MAX_CONCURRENT_REQUESTS = 100; // Максимум одновременных запросов
const METRICS_INTERVAL = 1000; // Интервал сбора метрик (1 секунда)

// Чтение параметров из БД и запуск самого теста
async function run() {
  try {
    // 1) Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // 2) Загружаем описание теста
    const lt = await LoadTest.findById(workerData.testId);
    if (!lt) {
      parentPort.postMessage({ error: 'Test not found' });
      return process.exit(1);
    }

    const { method, url, headers, body } = lt.request;
    const { duration, rate } = lt.config;

    // 3) Инициализируем результаты
    const results = {
      totalRequests: 0,
      success: 0,
      failure: 0,
      latencies: [],
      statusCodes: {},
      errors: {},
      metrics: {
        requestsPerSecond: [],
        errorsPerSecond: [],
        latenciesPerSecond: []
      }
    };

    const endTime = Date.now() + duration * 1000;
    let lastMetricsTime = Date.now();
    let currentSecondRequests = 0;
    let currentSecondErrors = 0;
    let currentSecondLatencies = [];

    // 4) Функция одной итерации
    async function singleRequest() {
      const start = Date.now();
      try {
        const res = await axios.request({
          method,
          url,
          headers,
          data: body,
          validateStatus: () => true,
          timeout: REQUEST_TIMEOUT
        });

        const delta = Date.now() - start;
        results.totalRequests++;
        results.latencies.push(delta);
        currentSecondRequests++;
        currentSecondLatencies.push(delta);

        // Собираем статистику по статус кодам
        const statusCode = res.status;
        results.statusCodes[statusCode] = (results.statusCodes[statusCode] || 0) + 1;

        if (statusCode >= 200 && statusCode < 400) {
          results.success++;
        } else {
          results.failure++;
          currentSecondErrors++;
          results.errors[statusCode] = (results.errors[statusCode] || 0) + 1;
        }
      } catch (err) {
        results.totalRequests++;
        results.failure++;
        currentSecondErrors++;

        // Собираем статистику по ошибкам
        const errorType = err.code || 'unknown';
        results.errors[errorType] = (results.errors[errorType] || 0) + 1;
      }
    }

    // 5) Функция сбора метрик
    function collectMetrics() {
      const now = Date.now();
      if (now - lastMetricsTime >= METRICS_INTERVAL) {
        results.metrics.requestsPerSecond.push(currentSecondRequests);
        results.metrics.errorsPerSecond.push(currentSecondErrors);
        results.metrics.latenciesPerSecond.push(
          currentSecondLatencies.length
            ? currentSecondLatencies.reduce((a, b) => a + b, 0) / currentSecondLatencies.length
            : 0
        );

        currentSecondRequests = 0;
        currentSecondErrors = 0;
        currentSecondLatencies = [];
        lastMetricsTime = now;
      }
    }

    // 6) Запускаем цикл с нужным RPS
    while (Date.now() < endTime) {
      const promises = [];
      const batchSize = Math.min(rate, MAX_CONCURRENT_REQUESTS);
      
      for (let i = 0; i < batchSize; i++) {
        promises.push(singleRequest());
      }

      // Ждем завершения всех запросов в батче
      await Promise.all(promises);
      
      // Собираем метрики
      collectMetrics();

      // Если нужно больше запросов в секунду, запускаем еще батч
      if (rate > MAX_CONCURRENT_REQUESTS) {
        const remainingRequests = rate - MAX_CONCURRENT_REQUESTS;
        const additionalPromises = [];
        
        for (let i = 0; i < remainingRequests; i++) {
          additionalPromises.push(singleRequest());
        }
        
        await Promise.all(additionalPromises);
        collectMetrics();
      }

      // Ждем до следующей секунды
      const elapsed = Date.now() - lastMetricsTime;
      if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
      }
    }

    // 7) Подсчет финальной статистики
    const sum = results.latencies.reduce((a, b) => a + b, 0);
    results.averageLatency = results.latencies.length ? sum / results.latencies.length : 0;
    
    // Сортируем латентности для расчета перцентилей
    const sortedLatencies = [...results.latencies].sort((a, b) => a - b);
    results.percentiles = {
      p50: sortedLatencies[Math.floor(sortedLatencies.length * 0.5)],
      p90: sortedLatencies[Math.floor(sortedLatencies.length * 0.9)],
      p95: sortedLatencies[Math.floor(sortedLatencies.length * 0.95)],
      p99: sortedLatencies[Math.floor(sortedLatencies.length * 0.99)]
    };

    // 8) Сохраняем результаты
    lt.results = results;
    await lt.save();

    parentPort.postMessage({ message: 'Load test finished', results });
    process.exit(0);
  } catch (err) {
    parentPort.postMessage({ error: err.message });
    process.exit(1);
  }
}

run();
