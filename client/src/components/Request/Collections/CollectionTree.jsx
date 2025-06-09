// src/components/Collections/CollectionTree.jsx
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  MoreVert,
  Edit,
  Delete,
  Add,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function CollectionTree({ collection, onSelectRequest }) {
  const qc = useQueryClient();

  const [expandedMap, setExpandedMap] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(''); // 'add' | 'rename'
  const [parentForNew, setParentForNew] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [formValues, setFormValues] = useState({
    name: '',
    type: 'folder',
    method: 'GET',
    url: '',
    headers: '{}',
    queryParams: '{}',
    body: '',
  });

  // --- API-мутэйшны ---
  const addItemMut = useMutation({
    mutationFn: async ({ collectionId, payload }) => {
      return axios.post(
        `/api/collections/${collectionId}/items`,
        payload,
        { withCredentials: true }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  });

  const renameItemMut = useMutation({
    mutationFn: async ({ itemId, name }) => {
      return axios.patch(
        `/api/collections/items/${itemId}/rename`,
        { name },
        { withCredentials: true }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  });

  const deleteItemMut = useMutation({
    mutationFn: async (itemId) => {
      return axios.delete(
        `/api/collections/items/${itemId}`,
        { withCredentials: true }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  });

  const reorderMut = useMutation({
    mutationFn: async ({ collectionId, items }) => {
      return axios.patch(
        `/api/collections/${collectionId}/reorder`,
        { items },
        { withCredentials: true }
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  });

  // --- Построение дерева из плоского списка ---
  const tree = useMemo(() => {
    const map = {};
    const roots = [];
    collection.items.forEach(i => { map[i.id] = { ...i, children: [] }; });
    Object.values(map).forEach(node => {
      const pid = node.parentId ? String(node.parentId) : null;
      if (pid && map[pid]) map[pid].children.push(node);
      else roots.push(node);
    });
    const sortRec = arr => {
      arr.sort((a, b) => (a.order || 0) - (b.order || 0));
      arr.forEach(ch => sortRec(ch.children));
    };
    sortRec(roots);
    return roots;
  }, [collection.items]);

  // --- Меню, диалоги ---
  const openMenu = (e, id) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuItemId(id); };
  const closeMenu = () => { setMenuAnchor(null); setMenuItemId(null); };

  const openAddDialog = parentId => {
    setDialogMode('add');
    setParentForNew(parentId);
    setFormValues({
      name: '',
      type: 'folder',
      method: 'GET',
      url: '',
      headers: '{}',
      queryParams: '{}',
      body: '',
    });
    setDialogOpen(true);
    closeMenu();
  };

  const openRenameDialog = item => {
    setDialogMode('rename');
    setEditingItem(item);
    setFormValues({
      name: item.name,
      type: item.type,
      method: item.request?.method || 'GET',
      url: item.request?.url || '',
      headers: JSON.stringify(item.request?.headers || {}, null, 2),
      queryParams: JSON.stringify(item.request?.queryParams || {}, null, 2),
      body: item.request?.body ? JSON.stringify(item.request.body, null, 2) : '',
    });
    setDialogOpen(true);
    closeMenu();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setParentForNew(null);
  };

  const handleDialogSubmit = () => {
    const { name, type, method, url, headers, queryParams, body } = formValues;
    if (!name.trim()) return;

    if (dialogMode === 'add') {
      const payload = { name: name.trim(), type };
      if (type === 'request') {
        let parsedHeaders = {}, parsedQuery = {}, parsedBody = null;
        try { parsedHeaders = JSON.parse(headers); } catch { return alert('Неверный JSON в заголовках'); }
        try { parsedQuery   = JSON.parse(queryParams); } catch { return alert('Неверный JSON в queryParams'); }
        if (body) try { parsedBody = JSON.parse(body); } catch { return alert('Неверный JSON в теле'); }

        payload.request = {
          method, url,
          headers: parsedHeaders,
          queryParams: parsedQuery,
          body: parsedBody,
        };
      }
      if (parentForNew) payload.parentId = parentForNew;

      addItemMut.mutate({ collectionId: collection._id, payload });
    }

    if (dialogMode === 'rename' && editingItem) {
      renameItemMut.mutate({ itemId: editingItem.id, name: name.trim() });
    }

    handleDialogClose();
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Удалить элемент?')) deleteItemMut.mutate(itemId);
    closeMenu();
  };

  const toggleExpand = id => {
    setExpandedMap(m => ({ ...m, [id]: !m[id] }));
  };

  const onDragEnd = result => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    const newParentId = destination.droppableId === collection._id ? null : destination.droppableId;
    const newOrder = destination.index;
    reorderMut.mutate({
      collectionId: collection._id,
      items: [{ id: draggableId, parentId: newParentId, order: newOrder }],
    });
  };

  // --- Рендер узла ---
  const renderNode = (node, depth = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedMap[node.id] !== false;

    return (
      <Draggable key={node.id} draggableId={node.id} index={node.order || 0}>
        {prov => (
          <Box
            ref={prov.innerRef}
            {...prov.draggableProps}
            sx={{ pl: depth * 2, display: 'flex', alignItems: 'center' }}
          >
            <Box {...prov.dragHandleProps} sx={{ mr: 1, cursor: 'grab' }}>⋮</Box>
            {isFolder
              ? <IconButton size="small" onClick={() => toggleExpand(node.id)}>
                  {isExpanded ? <ExpandLess/> : <ExpandMore/>}
                </IconButton>
              : <Box sx={{ width: 32 }}/>}
            <Box
              sx={{ flexGrow:1, display:'flex',alignItems:'center',cursor:'pointer','&:hover':{bgcolor:'#f5f5f5'} }}
              onClick={() => {
                if (isFolder) toggleExpand(node.id);
                else onSelectRequest(node);
              }}
            >
              {isFolder
                ? <FolderIcon sx={{mr:1}} color="primary"/>
                : <FileIcon   sx={{mr:1}} color="action"/>}
              <Typography noWrap variant="body2">{node.name}</Typography>
            </Box>
            <IconButton size="small" onClick={e => openMenu(e, node.id)}>
              <MoreVert fontSize="small"/>
            </IconButton>
          </Box>
        )}
      </Draggable>
    );
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">{collection.name}</Typography>
        <IconButton size="small" onClick={() => openAddDialog(null)}><Add/></IconButton>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={collection._id} type="ITEM">
          {prov => (
            <Box ref={prov.innerRef} {...prov.droppableProps}>
              {tree.map(node => (
                <React.Fragment key={node.id}>
                  {renderNode(node, 0)}
                  {node.type === 'folder' && expandedMap[node.id] !== false && node.children.map(ch =>
                    renderNode(ch, 1)
                  )}
                </React.Fragment>
              ))}
              {prov.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {/* Диалог */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === 'add' ? 'Новый элемент' : 'Переименовать элемент'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={formValues.name}
            onChange={e => setFormValues(v => ({ ...v, name: e.target.value }))}
            sx={{ mb:2 }}
          />
          {dialogMode === 'add' && (
            <FormControl fullWidth sx={{ mb:2 }}>
              <InputLabel>Тип</InputLabel>
              <Select
                value={formValues.type}
                label="Тип"
                onChange={e => setFormValues(v => ({ ...v, type: e.target.value }))}
              >
                <MenuItem value="folder">Папка</MenuItem>
                <MenuItem value="request">Запрос</MenuItem>
              </Select>
            </FormControl>
          )}
          {(dialogMode==='add' && formValues.type==='request') ||
           (dialogMode==='rename' && editingItem?.type==='request') ? (
            <>
              {/* Дополнительные поля для запроса */}
              <FormControl fullWidth sx={{ mb:2 }}>
                <InputLabel>Метод</InputLabel>
                <Select
                  value={formValues.method}
                  label="Метод"
                  onChange={e => setFormValues(v => ({ ...v, method: e.target.value }))}
                >
                  {['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS']
                    .map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="URL"
                value={formValues.url}
                onChange={e => setFormValues(v => ({ ...v, url: e.target.value }))}
                sx={{ mb:2 }}
              />
              <TextField
                fullWidth multiline minRows={2}
                label="Заголовки (JSON)"
                value={formValues.headers}
                onChange={e => setFormValues(v => ({ ...v, headers: e.target.value }))}
                helperText='{"Content-Type":"application/json"}'
                sx={{ mb:2 }}
              />
              <TextField
                fullWidth multiline minRows={2}
                label="Query Params (JSON)"
                value={formValues.queryParams}
                onChange={e => setFormValues(v => ({ ...v, queryParams: e.target.value }))}
                helperText='{"q":"search"}'
                sx={{ mb:2 }}
              />
              <TextField
                fullWidth multiline minRows={3}
                label="Тело запроса (JSON)"
                value={formValues.body}
                onChange={e => setFormValues(v => ({ ...v, body: e.target.value }))}
                sx={{ mb:2 }}
              />
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleDialogSubmit}
            disabled={formValues.name.trim()===''}
          >
            {dialogMode==='add' ? 'Создать' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Контекстное меню */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor) && menuItemId!==null}
        onClose={closeMenu}
      >
        <MenuItem onClick={() => openRenameDialog(
          collection.items.find(i => String(i.id)===String(menuItemId))
        )}>
          <Edit fontSize="small" sx={{mr:1}}/>Переименовать
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuItemId)}>
          <Delete fontSize="small" sx={{mr:1}}/>Удалить
        </MenuItem>
        <MenuItem onClick={() => openAddDialog(menuItemId)}>
          <Add fontSize="small" sx={{mr:1}}/>Добавить
        </MenuItem>
      </Menu>
    </>
  );
}

CollectionTree.propTypes = { 
  collection: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['folder','request']).isRequired,
      parentId: PropTypes.string,
      order: PropTypes.number,
      request: PropTypes.object,
    }))
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};
