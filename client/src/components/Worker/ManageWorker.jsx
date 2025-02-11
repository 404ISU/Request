// components/ManageWorkers.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ManageWorkers() {
  const [workers, setWorkers] = useState([]);
  const [newWorker, setNewWorker] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    name: '',
  });
  const [editingWorker, setEditingWorker] = useState(null); // Состояние для редактируемого работника

  // Загрузка списка работников
  const fetchWorkers = async () => {
    try {
      const response = await axios.get('/api/workers/get-workers');
      setWorkers(response.data);
    } catch (error) {
      toast.error('Ошибка при загрузке работников');
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Создание нового работника
  const handleCreateWorker = async () => {
    try {
      await axios.post('/api/workers/create-worker', newWorker);
      setNewWorker({ username: '', email: '', password: '', firstName: '', lastName: '', name: '' });
      toast.success('Работник успешно создан');
      fetchWorkers();
    } catch (error) {
      toast.error('Ошибка при создании работника');
    }
  };

  // Редактирование работника
  const handleEditWorker = (worker) => {
    setEditingWorker({ ...worker }); // Открываем форму редактирования
  };

  const handleUpdateWorker = async () => {
    try {
      await axios.put(`/api/workers/update-worker/${editingWorker._id}`, {
        username: editingWorker.username,
        email: editingWorker.email,
        password: editingWorker.password, // Новый пароль
        firstName: editingWorker.firstName,
        lastName: editingWorker.lastName,
        name: editingWorker.name, // Имя, фамилия, отчество
      });
      setEditingWorker(null); // Закрываем форму редактирования
      toast.success('Данные работника успешно обновлены');
      fetchWorkers();
    } catch (error) {
      toast.error('Ошибка при обновлении данных работника');
    }
  };

  // Удаление работника
  const handleDeleteWorker = async (workerId) => {
    try {
      await axios.delete(`/api/workers/delete-worker/${workerId}`);
      toast.success('Работник успешно удален');
      fetchWorkers();
    } catch (error) {
      toast.error('Ошибка при удалении работника');
    }
  };

  return (
    <div>
      <h2>Управление работниками</h2>

      {/* Форма создания нового работника */}
      <div>
        <h3>Создать нового работника</h3>
        <input
          type="text"
          placeholder="Логин"
          value={newWorker.username}
          onChange={(e) =>
            setNewWorker({ ...newWorker, username: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={newWorker.email}
          onChange={(e) =>
            setNewWorker({ ...newWorker, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Пароль"
          value={newWorker.password}
          onChange={(e) =>
            setNewWorker({ ...newWorker, password: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Имя"
          value={newWorker.firstName}
          onChange={(e) =>
            setNewWorker({ ...newWorker, firstName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Фамилия"
          value={newWorker.lastName}
          onChange={(e) =>
            setNewWorker({ ...newWorker, lastName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Отчество"
          value={newWorker.name}
          onChange={(e) =>
            setNewWorker({ ...newWorker, name: e.target.value })
          }
        />
        <button onClick={handleCreateWorker}>Создать</button>
      </div>

      {/* Форма редактирования работника */}
      {editingWorker && (
        <div>
          <h3>Редактирование работника</h3>
          <input
            type="text"
            placeholder="Логин"
            value={editingWorker.username}
            onChange={(e) =>
              setEditingWorker({ ...editingWorker, username: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={editingWorker.email}
            onChange={(e) =>
              setEditingWorker({ ...editingWorker, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Новый пароль (оставьте пустым, если не меняете)"
            value={editingWorker.password}
            onChange={(e) =>
              setEditingWorker({ ...editingWorker, password: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Имя"
            value={editingWorker.firstName}
            onChange={(e) =>
              setEditingWorker({ ...editingWorker, firstName: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={editingWorker.lastName}
            onChange={(e) =>
              setEditingWorker({ ...editingWorker, lastName: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Отчество"
            value={editingWorker.name}
            onChange={(e) =>
              setEditingWorker({ ...editingWorker, name: e.target.value })
            }
          />
          <button onClick={handleUpdateWorker}>Сохранить</button>
          <button onClick={() => setEditingWorker(null)}>Отмена</button>
        </div>
      )}

      {/* Список работников */}
      <div>
        <h3>Список работников</h3>
        {workers.length === 0 ? (
          <p>Нет работников в организации.</p>
        ) : (
          <ul>
            {workers.map((worker) => (
              <li key={worker._id}>
                {worker.firstName} {worker.lastName} {worker.name} ({worker.email})
                <button onClick={() => handleEditWorker(worker)}>Редактировать</button>
                <button onClick={() => handleDeleteWorker(worker._id)}>Удалить</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}