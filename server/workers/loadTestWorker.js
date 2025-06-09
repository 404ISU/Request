// workers/loadTestWorker.js
const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

// Подключаем модель (путь может меняться, у вас — '../models/LoadTest')
const LoadTest = require(path.join(__dirname, '../models/LoadTest'));

// Чтение параметров из БД и запуск самого теста
async function run() {
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

  const results = {
    totalRequests: 0,
    success: 0,
    failure: 0,
    latencies: []
  };

  const endTime = Date.now() + duration * 1000;

  // 3) Функция одной итерации
  async function singleRequest() {
    const start = Date.now();
    try {
      const res = await axios.request({ method, url, headers, data: body, validateStatus: () => true });
      const delta = Date.now() - start;
      results.totalRequests++;
      results.latencies.push(delta);
      if (res.status >= 200 && res.status < 400) {
        results.success++;
      } else {
        results.failure++;
      }
    } catch (err) {
      results.totalRequests++;
      results.failure++;
    }
  }

  // 4) Запускаем цикл с нужным RPS
  while (Date.now() < endTime) {
    const promises = [];
    for (let i = 0; i < rate; i++) {
      promises.push(singleRequest());
    }
    // ждем, пока все RPS-запросы завершатся, затем — следующую порцию
    await Promise.all(promises);
  }

  // 5) Подсчет статистики
  const sum = results.latencies.reduce((a, b) => a + b, 0);
  const avgLatency = results.latencies.length ? sum / results.latencies.length : 0;
  results.averageLatency = avgLatency;

  // 6) Сохраняем в документ
  lt.results = results;
  await lt.save();

  parentPort.postMessage({ message: 'Load test finished', results });
  process.exit(0);
}

// Обрабатываем ошибки
run().catch(err => {
  parentPort.postMessage({ error: err.message });
  process.exit(1);
});
