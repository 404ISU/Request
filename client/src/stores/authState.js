import atom from 'atom';
import api from '../utils/api';
import { useState, useEffect } from 'react';

const userAtom = atom(null);
const loadingAtom = atom(false);
const errorAtom = atom(null);
const isAuthenticatedAtom = atom(false);
const organizationUsersAtom = atom([]);


export const useAuthState = () => {
    const [user, setUser] = useState(userAtom.get());
    const [loading, setLoading] = useState(loadingAtom.get());
    const [error, setError] = useState(errorAtom.get());
    const [isAuthenticated, setIsAuthenticated] = useState(isAuthenticatedAtom.get());
    const [organizationUsers, setOrganizationUsers] = useState(organizationUsersAtom.get());

       useEffect(()=> {
        const userSubscriber = userAtom.subscribe(val => setUser(val));
        const loadingSubscriber = loadingAtom.subscribe(val => setLoading(val));
        const errorSubscriber = errorAtom.subscribe(val => setError(val));
        const isAuthenticatedSubscriber = isAuthenticatedAtom.subscribe(val => setIsAuthenticated(val));
        const organizationUsersSubscriber = organizationUsersAtom.subscribe(val => setOrganizationUsers(val));
        return () => {
            userSubscriber()
            loadingSubscriber()
            errorSubscriber()
            isAuthenticatedSubscriber()
           organizationUsersSubscriber()
        }
    }, [])


     const registerOrganization = async (data) => {
        setLoading(true)
        try {
            const response = await api.post('/api/auth/register', data);
           userAtom.set(response.data.user);
           isAuthenticatedAtom.set(true);
        } catch (err) {
            errorAtom.set(err.response?.data?.message || 'Error during registration');
        } finally {
            setLoading(false)
        }
    };

    const login = async (data) => {
         setLoading(true)
        try {
            const response = await api.post('/api/auth/login', data);
            userAtom.set(response.data.user)
            isAuthenticatedAtom.set(true)
        } catch (err) {
           errorAtom.set(err.response?.data?.message || 'Error during login');
        } finally {
            setLoading(false)
        }
    };

   const logout = async () => {
        try {
            await api.get('/api/auth/logout');
             userAtom.set(null);
            isAuthenticatedAtom.set(false)
        } catch (err) {
            console.error('Logout error', err);
        }
    };

    const fetchUser = async () => {
         setLoading(true)
        try {
            const response = await api.get('/api/auth/me');
             userAtom.set(response.data);
            isAuthenticatedAtom.set(true)
        } catch (err) {
            isAuthenticatedAtom.set(false);
            userAtom.set(null);
             errorAtom.set(err.response?.data?.message || 'Error fetching user');
        } finally {
            setLoading(false)
        }
    };

     const createUser = async (data) => {
         setLoading(true)
        try {
           await api.post('/api/users', data);
           await fetchOrganizationUsers();
            errorAtom.set(null)
        } catch (err) {
             errorAtom.set(err.response?.data?.message || 'Error creating user');
        } finally {
            setLoading(false)
        }
    };

    const fetchOrganizationUsers = async () => {
         if (!isAuthenticated) return;
         setLoading(true)
        try {
            const response = await api.get('/api/users');
             organizationUsersAtom.set(response.data);
        }catch (err) {
             errorAtom.set(err.response?.data?.message || 'Error fetching users');
        } finally {
            setLoading(false)
        }
    };

     const updateUser = async (id, data) => {
          setLoading(true)
        try {
            await api.put(`/api/users/${id}`, data);
           await fetchOrganizationUsers();
            errorAtom.set(null);
        } catch (err) {
           errorAtom.set(err.response?.data?.message || 'Error editing user');
        } finally {
             setLoading(false)
        }
    };

    const deleteUser = async (id) => {
         setLoading(true)
        try {
            await api.delete(`/api/users/${id}`);
            await fetchOrganizationUsers();
           errorAtom.set(null);
        } catch (err) {
             errorAtom.set(err.response?.data?.message || 'Error deleting user');
        } finally {
             setLoading(false)
        }
    };

    const clearError = () => {
        errorAtom.set(null);
    };

    return {
        user,
        loading,
        error,
        isAuthenticated,
        organizationUsers,
        registerOrganization,
        login,
        logout,
        fetchUser,
        createUser,
        fetchOrganizationUsers,
        updateUser,
        deleteUser,
        clearError,
    };
};