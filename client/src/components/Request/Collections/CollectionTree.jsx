// CollectionTree.jsx
import React, { useState } from 'react';
import {
  Box, Typography, IconButton,
  ListItem, ListItemText,
  Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, TextField, Button
} from '@mui/material';
import {
  Folder, InsertDriveFile, Delete, Edit,
  MoreVert, ExpandLess, ExpandMore, Add
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';

// Диалог создания нового элемента
function NewItemDialog({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('request');
  const handleCreate = async () => {
    if (!name.trim()) return;
    await onCreate({ name: name.trim(), type });
    setName('');
    setType('request');
    onClose();
  };
  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>Создать новый элемент</DialogTitle>
      <DialogContent>
        <Select
          fullWidth
          value={type}
          onChange={e => setType(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="request">Запрос</MenuItem>
          <MenuItem value="folder">Папка</MenuItem>
        </Select>
        <TextField
          fullWidth
          label="Название элемента"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleCreate} disabled={!name.trim()}>
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}
NewItemDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
};

// Рекурсивный компонент элемента дерева
function TreeItem({
  item, index, depth, collectionId,
  onDelete, onAddItem, expandedMap, setExpandedMap
}) {
  const qc = useQueryClient();
  const isFolder = item.type === 'folder';
  const isExpanded = expandedMap[item._id] ?? true;
  const [menuAnchor, setMenuAnchor] = useState(null);

  const toggle = async () => {
    const next = !isExpanded;
    setExpandedMap(m => ({ ...m, [item._id]: next }));
    await axios.patch(`/api/collections/items/${item._id}/toggle`, { isExpanded: next });
    qc.invalidateQueries(['collections']);
  };

  const rename = async () => {
    const newName = prompt('Новое имя', item.name);
    if (!newName) return;
    await axios.patch(`/api/collections/items/${item._id}/rename`, { name: newName });
    qc.invalidateQueries(['collections']);
  };

  const remove = async () => {
    await onDelete(item._id);
    qc.invalidateQueries(['collections']);
  };

  return (
    <Draggable draggableId={String(item._id)} index={index}>
      {prov => (
        <div
          ref={prov.innerRef}
          {...prov.draggableProps}
          style={{ paddingLeft: depth * 24, ...prov.draggableProps.style }}
        >
          <ListItem {...prov.dragHandleProps} divider>
            {isFolder && (
              <IconButton size="small" onClick={toggle}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            {isFolder ? <Folder sx={{ mr: 1 }} /> : <InsertDriveFile sx={{ mr: 1 }} />}
            <ListItemText
              primary={item.name}
              secondary={
                item.type === 'request' && item.request
                  ? `${item.request.method || ''} ${item.request.url || ''}`.trim()
                  : 'Папка'
              }
            />
            {isFolder && (
              <IconButton size="small" onClick={() => onAddItem(item._id)}>
                <Add />
              </IconButton>
            )}
            <IconButton size="small" onClick={e => setMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={rename}>
                <Edit sx={{ mr: 1 }} />Переименовать
              </MenuItem>
              <MenuItem onClick={remove}>
                <Delete sx={{ mr: 1 }} />Удалить
              </MenuItem>
            </Menu>
          </ListItem>

          {isFolder && isExpanded && Array.isArray(item.children) && (
            <Droppable droppableId={String(item._id)} type="ITEM">
              {provDrop => (
                <div ref={provDrop.innerRef} {...provDrop.droppableProps}>
                  {item.children.map((child, idx) => (
                    <TreeItem
                      key={child._id}
                      item={child}
                      index={idx}
                      depth={depth + 1}
                      collectionId={collectionId}
                      onDelete={onDelete}
                      onAddItem={onAddItem}
                      expandedMap={expandedMap}
                      setExpandedMap={setExpandedMap}
                    />
                  ))}
                  {provDrop.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}
TreeItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  depth: PropTypes.number.isRequired,
  collectionId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddItem: PropTypes.func.isRequired,
  expandedMap: PropTypes.object.isRequired,
  setExpandedMap: PropTypes.func.isRequired
};

// Главный компонент
export function CollectionTree({ collection, onDelete }) {
  const qc = useQueryClient();
  const [expandedMap, setExpandedMap] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingParentId, setPendingParentId] = useState(null);

  const handleAddItem = parentId => {
    setPendingParentId(parentId);
    setDialogOpen(true);
  };
  const handleCreate = async ({ name, type }) => {
    await axios.post(
      `/api/collections/${collection._id}/items`,
      { name, type, parentId: pendingParentId }
    );
    qc.invalidateQueries(['collections']);
    setDialogOpen(false);
    setPendingParentId(null);
  };
  const handleDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    const newParentId =
      destination.droppableId === String(collection._id) ? null : destination.droppableId;
    await axios.patch(
      `/api/collections/${collection._id}/reorder`,
      { items: [{ id: draggableId, parentId: newParentId, order: destination.index }] }
    );
    qc.invalidateQueries(['collections']);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={1} alignItems="center">
        <Typography variant="h6">{collection.name}</Typography>
        <IconButton size="small" onClick={() => handleAddItem(null)}>
          <Add />
        </IconButton>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={String(collection._id)} type="ITEM">
          {prov => (
            <div ref={prov.innerRef} {...prov.droppableProps}>
              {Array.isArray(collection.items) && collection.items.map((item, idx) => (
                <TreeItem
                  key={item._id}
                  item={item}
                  index={idx}
                  depth={0}
                  collectionId={collection._id}
                  onDelete={onDelete}
                  onAddItem={handleAddItem}
                  expandedMap={expandedMap}
                  setExpandedMap={setExpandedMap}
                />
              ))}
              {prov.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <NewItemDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setPendingParentId(null); }}
        onCreate={handleCreate}
      />
    </Box>
  );
}
CollectionTree.propTypes = {
  collection: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  onDelete: PropTypes.func.isRequired
};
