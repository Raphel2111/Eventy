import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Cambia esta IP por la IP local de tu ordenador
// Si usas emulador Android, a veces funciona 'http://10.0.2.2:8000/api/'
// Si usas dispositivo físico, usa tu IP local (ej: 192.168.1.35)
const API_URL = 'https://eventy-backend.onrender.com/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
