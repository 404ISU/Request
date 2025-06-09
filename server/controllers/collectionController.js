// controllers/collectionController.js
const mongoose = require('mongoose');
const Collection = require('../models/Collection');

class CollectionController {
  // 1) Получить все коллекции текущего пользователя
  async list(req, res) {
    try {
      const userId = req.user._id;
      const collections = await Collection.find({ owner: userId }).lean();
      res.json(collections);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  // 2) Создать новую коллекцию
  async create(req, res) {
    try {
      const userId = req.user._id;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Поле "name" обязательно' });
      }
      const newColl = new Collection({ name, owner: userId, items: [] });
      await newColl.save();
      res.status(201).json(newColl);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  // 3) Переименовать коллекцию
  async rename(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Поле "name" обязательно' });
      }
      const coll = await Collection.findOne({ _id: id, owner: userId });
      if (!coll) return res.status(404).json({ message: 'Коллекция не найдена' });
      coll.name = name;
      await coll.save();
      res.json(coll);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  // 4) Удалить коллекцию
  async remove(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const deleted = await Collection.findOneAndDelete({ _id: id, owner: userId });
      if (!deleted) return res.status(404).json({ message: 'Коллекция не найдена' });
      res.json({ message: 'Удалено' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  // 5) Добавить элемент (folder или request) в коллекцию
  async addItem(req, res) {
    try {
      const userId = req.user._id;
      const { collectionId } = req.params;
      const { name, type, parentId, request } = req.body;

      if (!name || !type) {
        return res.status(400).json({ message: 'Поля "name" и "type" обязательны' });
      }
      if (!['folder','request'].includes(type)) {
        return res.status(400).json({ message: 'Поле "type" должно быть folder или request' });
      }

      const coll = await Collection.findOne({ _id: collectionId, owner: userId });
      if (!coll) return res.status(404).json({ message: 'Коллекция не найдена' });

      // Проверяем существование родительской папки
      if (parentId) {
        const parentExists = coll.items.some(item => 
          String(item.id) === String(parentId) && item.type === 'folder'
        );
        if (!parentExists) {
          return res.status(400).json({ message: 'Родительская папка не найдена' });
        }
      }

      // Подсчитываем order среди siblings
      const siblings = coll.items.filter(i => String(i.parentId) === String(parentId || null));
      const newOrder = siblings.length;

      const newItem = {
        id: new mongoose.Types.ObjectId(),
        name: name.trim(),
        type,
        parentId: parentId || null,
        order: newOrder,
        request: type === 'request'
          ? {
              method: request?.method || 'GET',
              url: request?.url || '',
              headers: request?.headers || {},
              queryParams: request?.queryParams || {},
              body: request?.body || {}
            }
          : undefined
      };

      coll.items.push(newItem);
      await coll.save();
      res.status(201).json(newItem);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  // 6) Переименовать элемент
  async renameItem(req, res) {
    try {
      const userId = req.user._id;
      const { itemId } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Поле "name" обязательно' });
      }

      const coll = await Collection.findOne({ owner: userId, 'items.id': itemId });
      if (!coll) return res.status(404).json({ message: 'Элемент не найден' });

      const item = coll.items.find(i => String(i.id) === String(itemId));
      item.name = name;
      await coll.save();
      res.json(item);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  // 7) Удалить элемент
  async deleteItem(req, res) {
    try {
      const userId = req.user._id;
      const { itemId } = req.params;

      const coll = await Collection.findOne({ owner: userId, 'items.id': itemId });
      if (!coll) return res.status(404).json({ message: 'Элемент не найден' });

      coll.items = coll.items.filter(i => String(i.id) !== String(itemId));
      await coll.save();
      res.json({ message: 'Элемент удалён' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }

  // 8) Переупорядочить (drag & drop) элементы
  async reorderItems(req, res) {
    try {
      const userId = req.user._id;
      const { collectionId } = req.params;
      const { items: updatedItems } = req.body;

      if (!Array.isArray(updatedItems)) {
        return res.status(400).json({ message: 'Field "items" must be an array' });
      }

      const coll = await Collection.findOne({ _id: collectionId, owner: userId });
      if (!coll) return res.status(404).json({ message: 'Коллекция не найдена' });

      // Обновляем порядок и родителя для каждого элемента
      updatedItems.forEach(u => {
        const item = coll.items.find(x => String(x.id) === String(u.id));
        if (item) {
          // Проверяем существование родительской папки
          if (u.parentId) {
            const parentExists = coll.items.some(x => 
              String(x.id) === String(u.parentId) && x.type === 'folder'
            );
            if (!parentExists) {
              throw new Error(`Parent folder ${u.parentId} not found`);
            }
          }
          
          item.parentId = u.parentId || null;
          item.order = u.order;
        }
      });

      // Сортируем элементы по parentId и order
      coll.items.sort((a, b) => {
        if (String(a.parentId) !== String(b.parentId)) {
          return String(a.parentId || '').localeCompare(String(b.parentId || ''));
        }
        return (a.order || 0) - (b.order || 0);
      });

      await coll.save();
      res.json({ message: 'Порядок обновлён' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new CollectionController();
