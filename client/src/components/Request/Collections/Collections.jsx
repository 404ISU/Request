import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField
} from '@mui/material';
import { Folder, Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import { CollectionTree } from './CollectionTree';

export const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get('/api/collections');
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      await axios.post('/api/collections', { name: newCollectionName });
      await fetchCollections();
      setNewCollectionOpen(false);
      setNewCollectionName('');
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleDeleteCollection = async (id) => {
    try {
      await axios.delete(`/api/collections/${id}`);
      await fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Collections</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewCollectionOpen(true)}
        >
          New Collection
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <List sx={{ width: 300, bgcolor: 'background.paper' }}>
          {collections.map(collection => (
            <ListItem
              key={collection._id}
              button
              selected={selectedCollection?._id === collection._id}
              onClick={() => setSelectedCollection(collection)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.light' }
                }
              }}
            >
              <Folder sx={{ mr: 2 }} />
              <ListItemText 
                primary={collection.name} 
                secondary={`${collection.rootItems?.length || 0} items`}
              />
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCollection(collection._id);
                }}
              >
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>

        {selectedCollection && (
          <Box sx={{ flexGrow: 1 }}>
            <CollectionTree 
              collection={selectedCollection} 
              onUpdate={fetchCollections}
            />
          </Box>
        )}
      </Box>

      <Dialog open={newCollectionOpen} onClose={() => setNewCollectionOpen(false)}>
        <DialogTitle>New Collection</DialogTitle>
        <DialogContent sx={{ minWidth: 400, py: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Collection Name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setNewCollectionOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim()}
            >
              Create
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};