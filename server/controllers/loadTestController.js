// controllers/loadTestController.js
const { Worker } = require('worker_threads');
const path = require('path');
const LoadTest = require('../models/LoadTest');

class LoadTestController {
  // Создать новый «нагрузочный» тест
  async create(req, res) {
    try {
      const lt = new LoadTest(req.body);
      await lt.save();
      res.status(201).json(lt);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Запустить тест в фоне (воркер)
async run(req, res) {
  const { id } = req.params;
  const lt = await LoadTest.findById(id);
  if (!lt) return res.status(404).json({ message: 'Not found' });

  const worker = new Worker(path.join(__dirname, '../workers/loadTestWorker.js'), {
    workerData: { testId: id }
  });

  worker.on('message', msg => {
    console.log('Worker message:', msg);
  });
  worker.on('error', err => console.error('Worker error:', err));
  worker.on('exit', code => console.log(`Worker exited with code ${code}`));

  res.json({ message: 'Load test started' });
}

  // Получить статус/результаты теста
  async getStatus(req, res) {
    try {
      const { id } = req.params;
      const lt = await LoadTest.findById(id);
      if (!lt) return res.status(404).json({ message: 'Not found' });
      res.json({ results: lt.results });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Получить список всех нагрузочных тестов
  async getAllLoadTests(req, res) {
    try {
      const filter = {};
      if (req.query.collectionId) {
        filter.collectionId = req.query.collectionId;
      }
      const all = await LoadTest.find(filter).sort({ createdAt: -1 });
      res.json(all);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  // Удалить тест
  async delete(req, res) {
    try {
      const { id } = req.params;
      const lt = await LoadTest.findByIdAndDelete(id);
      if (!lt) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new LoadTestController();
