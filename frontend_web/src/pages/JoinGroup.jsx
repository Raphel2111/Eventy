import React, { useEffect, useState } from 'react';
import axios from '../api';
import { fetchCurrentUser } from '../auth';

export default function JoinGroup({ token, onSuccess, onCancel }) {
    const [invitationInfo, setInvitationInfo] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCurrentUser().then(u => setCurrentUser(u));
    }, []);

    useEffect(() => {
        if (!token) return;
        loadInvitationInfo();
    }, [token]);

    function loadInvitationInfo() {
        setLoading(true);
        setError('');
        
        // Public endpoint to get invitation info
        axios.get(`groups/invitation-info/${token}/`)
            .then(res => {
                setInvitationInfo(res.data);
            })
            .catch(err => {
                setError(err.response?.data?.detail || 'Invitación no válida');
            })
            .finally(() => setLoading(false));
    }

    function acceptInvitation() {
        if (!currentUser) {
            alert('Debes iniciar sesión primero');
            return;
        }

        setJoining(true);
        setError('');

        axios.post('groups/accept_invitation/', { token })
            .then(res => {
                alert(res.data.detail || 'Te has unido al grupo exitosamente');
                if (onSuccess) {
                    onSuccess(res.data.group_id);
                }
            })
            .catch(err => {
                setError(err.response?.data?.detail || 'Error al unirse al grupo');
            })
            .finally(() => setJoining(false));
    }

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <p>Cargando invitación...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="card" style={{borderLeft: '4px solid var(--danger)'}}>
                    <h3 style={{marginTop:0}}>❌ Error</h3>
                    <p>{error}</p>
                    {onCancel && (
                        <button className="btn secondary" onClick={onCancel} style={{marginTop:12}}>
                            Volver
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!invitationInfo) {
        return (
            <div className="container">
                <div className="card">
                    <p>Invitación no encontrada</p>
                </div>
            </div>
        );
    }

    if (!invitationInfo.valid) {
        return (
            <div className="container">
                <div className="card" style={{borderLeft: '4px solid var(--danger)'}}>
                    <h3 style={{marginTop:0}}>⚠️ Invitación expirada</h3>
                    <p>Esta invitación ya no es válida. Puede haber expirado o alcanzado su límite de usos.</p>
                    {onCancel && (
                        <button className="btn secondary" onClick={onCancel} style={{marginTop:12}}>
                            Volver
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card" style={{borderLeft: '4px solid var(--primary)'}}>
                <h2 style={{marginTop:0}}>🎉 Invitación a grupo</h2>
                
                <div style={{marginTop:16,marginBottom:16}}>
                    <h3>{invitationInfo.group_name}</h3>
                    {invitationInfo.group_description && (
                        <p className="muted">{invitationInfo.group_description}</p>
                    )}
                </div>

                <div style={{fontSize:'0.9em',marginBottom:16}}>
                    <div className="muted">Invitado por: {invitationInfo.created_by}</div>
                    <div className="muted">Expira: {new Date(invitationInfo.expires_at).toLocaleString()}</div>
                    {invitationInfo.max_uses && (
                        <div className="muted">
                            Usos restantes: {invitationInfo.max_uses - invitationInfo.use_count}
                        </div>
                    )}
                </div>

                {!currentUser ? (
                    <div>
                        <p style={{color:'var(--danger)'}}>⚠️ Debes iniciar sesión para aceptar esta invitación</p>
                        <button className="btn secondary" onClick={onCancel}>
                            Ir a inicio de sesión
                        </button>
                    </div>
                ) : (
                    <div style={{display:'flex',gap:8}}>
                        <button 
                            className="btn" 
                            onClick={acceptInvitation} 
                            disabled={joining}
                        >
                            {joining ? 'Uniéndose...' : '✅ Unirse al grupo'}
                        </button>
                        {onCancel && (
                            <button className="btn secondary" onClick={onCancel} disabled={joining}>
                                Cancelar
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
