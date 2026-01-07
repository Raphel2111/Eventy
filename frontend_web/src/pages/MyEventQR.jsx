import React, { useEffect, useState } from 'react';
import axios from '../api';
import { fetchCurrentUser } from '../auth';

export default function MyEventQR({ eventId, onBack }) {
    const [event, setEvent] = useState(null);
    const [myRegistration, setMyRegistration] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentUser().then(u => setCurrentUser(u));
    }, []);

    useEffect(() => {
        if (!eventId || !currentUser) return;
        loadMyQR();
    }, [eventId, currentUser]);

    function loadMyQR() {
        setLoading(true);
        
        Promise.all([
                axios.get(`events/${eventId}/`),
                // Solo cargar MIS registros para este evento
                axios.get(`registrations/?event=${eventId}&user=${currentUser.id}`)
        ])
        .then(([eventRes, regsRes]) => {
            setEvent(eventRes.data);
            const payload = regsRes.data;
            const items = Array.isArray(payload) ? payload : (payload.results || []);
            
            // Tomar el primer registro (debería haber solo uno por usuario por evento)
            const myReg = items.length > 0 ? items[0] : null;
            setMyRegistration(myReg);
        })
        .catch(err => console.error('Error loading QR:', err))
        .finally(() => setLoading(false));
    }

    function createMyRegistration() {
        if (!currentUser) {
            alert('No se pudo obtener el usuario actual');
            return;
        }

            axios.post('registrations/', { event: eventId, user: currentUser.id })
            .then(res => {
                setMyRegistration(res.data);
                alert('Tu QR ha sido generado exitosamente.');
            })
            .catch(err => {
                console.error('Error creating registration:', err.response?.data || err.message);
                alert('Error al crear QR: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
            });
    }

    if (loading) return <div className="container"><p>Cargando...</p></div>;
    if (!event) return <div className="container"><p>Evento no encontrado</p></div>;

    return (
        <div className="container">
            <button className="btn secondary" onClick={onBack} style={{marginBottom:12}}>← Volver</button>
            
            <div className="card">
                <h2 style={{marginTop:0}}>Mi QR para: {event.name}</h2>
                <div className="muted">{event.date ? new Date(event.date).toLocaleString() : 'Fecha desconocida'}</div>
                <div style={{marginTop:10}}>
                    <strong>Ubicación:</strong> {event.location || 'No especificada'}
                </div>
            </div>

            {!myRegistration ? (
                <div className="card" style={{marginTop:20,textAlign:'center'}}>
                    <p>Aún no tienes un QR para este evento.</p>
                    <button className="btn" onClick={createMyRegistration}>Generar mi QR</button>
                </div>
            ) : (
                <div className="card" style={{marginTop:20}}>
                    <h3>Tu código QR personal</h3>
                    <div style={{display:'flex',gap:20,alignItems:'center',marginTop:12}}>
                        <div style={{flex:1}}>
                            <div><strong>Código:</strong> <code>{myRegistration.entry_code}</code></div>
                            <div style={{marginTop:8}}>
                                <strong>Estado:</strong> {myRegistration.used ? 
                                    <span style={{color:'var(--danger)'}}>✓ Usado</span> : 
                                    <span style={{color:'green'}}>✓ Activo</span>
                                }
                            </div>
                            {myRegistration.used && (
                                <div className="muted" style={{marginTop:8}}>
                                    Este QR ya ha sido escaneado y validado.
                                </div>
                            )}
                        </div>
                        {myRegistration.qr_url && (
                            <div style={{textAlign:'center'}}>
                                <img 
                                    src={myRegistration.qr_url} 
                                    alt="Mi QR" 
                                    style={{
                                        width:200,
                                        height:200,
                                        border:'2px solid #ddd',
                                        borderRadius:8,
                                        padding:10,
                                        background:'white'
                                    }} 
                                />
                                <div style={{marginTop:10}}>
                                    <a 
                                        href={myRegistration.qr_url} 
                                        download 
                                        className="btn secondary" 
                                        style={{fontSize:'0.9em'}}
                                    >
                                        Descargar QR
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={{marginTop:20,padding:12,background:'#f3f4f6',borderRadius:8}}>
                        <strong>Instrucciones:</strong>
                        <ul style={{marginTop:8,marginBottom:0}}>
                            <li>Presenta este QR al administrador del evento</li>
                            <li>El admin escaneará tu código para validar tu entrada</li>
                            <li>Una vez escaneado, el QR quedará marcado como usado</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
