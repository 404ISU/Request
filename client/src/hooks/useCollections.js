import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useCollections = () => {
  const queryClient = useQueryClient();

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await axios.get('/api/collections');
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (name) => axios.post('/api/collections', { name }),
    onSuccess: () => queryClient.invalidateQueries(['collections'])
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => axios.patch(`/api/collections/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['collections'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/collections/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['collections'])
  });

  const reorderMutation = useMutation({
    mutationFn: (reorderedItems) => axios.post('/api/collections/reorder', { items: reorderedItems })
  });

  return {
    collections,
    isLoading,
    createCollection: createMutation.mutate,
    updateCollection: updateMutation.mutate,
    deleteCollection: deleteMutation.mutate,
    reorderCollections: reorderMutation.mutate
  };
};