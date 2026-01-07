import api from './api';

export function parseJwt(token){
    if (!token) return null;
    try{
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const json = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
        return JSON.parse(decodeURIComponent(escape(json)));
    }catch(e){
        return null;
    }
}

export async function fetchCurrentUser(){
    const token = localStorage.getItem('access_token');
    const payload = parseJwt(token);
    if (!payload) return null;
    const id = payload.user_id || payload.id || payload.sub;
    if (!id) return null;
    try{
        const res = await api.get(`users/${id}/`);
        return res.data;
    }catch(e){
        return null;
    }
}

export default { parseJwt, fetchCurrentUser };
