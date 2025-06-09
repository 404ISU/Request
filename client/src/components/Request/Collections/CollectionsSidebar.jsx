import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton,
  Button, LinearProgress, Alert
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';
import {
  DndContext, closestCenter
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function CollectionsSidebar({ onSelect }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');
  const token = localStorage.getItem('token');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/collections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollections(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async () => {
    if (!newName.trim()) return;
    try {
      await axios.post('/api/collections', { name: newName.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewName('');
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Удалить коллекцию?')) return;
    try {
      await axios.delete(`/api/collections/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const rename = async (id, oldName) => {
    const name = window.prompt('Новое имя', oldName);
    if (!name?.trim()) return;
    try {
      await axios.patch(`/api/collections/${id}/rename`, { name: name.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const onDragEnd = useCallback(async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const aIdx = collections.findIndex(c => c._id === active.id);
    const oIdx = collections.findIndex(c => c._id === over.id);
    const reordered = [...collections];
    const [moved] = reordered.splice(aIdx, 1);
    reordered.splice(oIdx, 0, moved);

    // формируем payload для reorder
    const items = reordered.map((c, idx) => ({
      id: c._id, parentId: null, order: idx
    }));
    try {
      // используем first collectionId in URL (передаем весь массив)
      await axios.patch(`/api/collections/${reordered[0]._id}/reorder`, 
        { items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCollections(reordered);
    } catch (err) {
      console.error(err);
    }
  }, [collections, token]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Коллекции
      </Typography>
      {loading && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <Box mb={2} display="flex">
        <TextField
          size="small"
          placeholder="Новая коллекция"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          fullWidth
        />
        <IconButton color="primary" onClick={create}>
          <Add />
        </IconButton>
      </Box>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={collections.map(c => c._id)}
          strategy={verticalListSortingStrategy}
        >
          {collections.map(coll => (
            <SortableItem
              key={coll._id}
              collection={coll}
              onSelect={onSelect}
              onDelete={remove}
              onRename={rename}
            />
          ))}
        </SortableContext>
      </DndContext>
    </Paper>
  );
}

function SortableItem({ collection, onSelect, onDelete, onRename }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition
  } = useSortable({ id: collection._id });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        borderRadius: 1,
        mb: 1,
        bgcolor: 'background.paper',
        boxShadow: 1,
        transform: CSS.Transform.toString(transform),
        transition,
        '&:hover': { bgcolor: 'action.hover' },
        cursor: 'pointer'
      }}
      onClick={() => onSelect(collection._id)}
    >
      <Typography noWrap sx={{ flex: 1 }}>
        {collection.name}
      </Typography>
      <IconButton
        size="small"
        onClick={e => { e.stopPropagation(); onRename(collection._id, collection.name); }}
      >
        <Edit fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={e => { e.stopPropagation(); onDelete(collection._id); }}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  );
}
