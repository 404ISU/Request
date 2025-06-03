// server/workers/loadTestWorker.js

const { workerData, parentPort } = require('worker_threads');
const LoadTest = require('../models/LoadTest');
// теперь подключаем artillery-core
const { Engine } = require('artillery-core');

async function runLoadTest() {
  // 1) Берём документ LoadTest из БД
  const loadTest = await LoadTest.findById(workerData.testId);
  if (!loadTest) {
    throw new Error('Load test not found');
  }

  // 2) Формируем конфиг для Artillery (в виде обычного JS-объекта)
  const { request, config } = loadTest;
  const testConfig = {
    config: {
      target: request.url,
      phases: [
        {
          duration: config.duration,   // в секундах
          arrivalRate: config.rate     // RPS
        }
      ],
      defaults: {
        headers: request.headers || {}
      }
    },
    scenarios: [
      {
        name: loadTest.name || 'default_scenario',
        flow: [
          {
            [request.method.toLowerCase()]: {
              url: request.url,
              json: request.body || {}
            }
          }
        ]
      }
    ]
  };

  try {
    // 3) Запускаем Artillery через Engine из artillery-core
    const engine = Engine(testConfig, {});

    // Engine.run() возвращает Promise<report>
    const report = await engine.run();
    // 4) Сохраняем результат в поле results и сохраняем документ
    loadTest.results = report;
    await loadTest.save();

    // 5) Отправляем сообщение родителю
    parentPort.postMessage({ status: 'completed', report });
  } catch (err) {
    parentPort.postMessage({ status: 'error', error: err.message });
  } finally {
    process.exit(0);
  }
}

// Если произошла “непредвиденная” ошибка
runLoadTest().catch(err => {
  parentPort.postMessage({ status: 'error', error: err.message });
  process.exit(1);
});
