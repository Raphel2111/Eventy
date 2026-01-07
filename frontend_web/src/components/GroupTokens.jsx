import React, { useEffect, useState } from 'react';
import axios from '../api';
import { fetchCurrentUser } from '../auth';

export default function GroupTokens({ groupId }){
    const [tokens, setTokens] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(()=>{
        fetchCurrentUser().then(u => setCurrentUser(u));
    }, []);

    useEffect(()=>{
        if(!groupId) return;
        axios.get(`group-tokens/?group=${groupId}`).then(res=>{
            const payload = res.data;
            const items = Array.isArray(payload) ? payload : (payload.results || []);
            setTokens(items);
        }).catch(()=>{});
    },[groupId]);

    async function createToken(){
        if(!currentUser){
            alert('No se pudo obtener el usuario actual');
            return;
        }
        axios.post('group-tokens/', { group: groupId, user: currentUser.id }).then(res=>{
            setTokens(prev=>[res.data, ...prev]);
        }).catch(err=>{
            console.error('Error creating token:', err.response?.data || err.message);
            alert('Error creating token: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
        });
    }

    return (
        <div>
            <h3>Tokens de acceso</h3>
            <button className="btn" onClick={createToken}>Crear token</button>
            {tokens.length === 0 ? (
                <p className="muted">No hay tokens. Crea uno para generar QR.</p>
            ) : (
                <div style={{display:'grid',gap:12,marginTop:12}}>
                    {tokens.map(t=> (
                        <div key={t.id} className="card" style={{display:'flex',gap:12,alignItems:'center'}}>
                            <div style={{flex:1}}>
                                <div><strong>Token:</strong> <code style={{fontSize:'0.85em'}}>{t.token}</code></div>
                                <div className="muted">Usos: {t.usage_count}</div>
                            </div>
                            {t.qr_url && (
                                <div>
                                    <img src={t.qr_url} alt="QR Code" style={{width:120,height:120,border:'1px solid #ddd',borderRadius:4}} />
                                    <div style={{textAlign:'center',marginTop:4}}>
                                        <a href={t.qr_url} download className="btn secondary" style={{fontSize:'0.85em',padding:'4px 8px'}}>Descargar</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
