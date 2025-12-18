import React, { useEffect, useState } from 'react';
import axios from '../api';
import { fetchCurrentUser } from '../auth';

export default function EventDetail({ eventId, onBack, onViewGroup }) {
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [showParticipants, setShowParticipants] = useState(false);

    useEffect(() => {
        fetchCurrentUser().then(u => setCurrentUser(u));
    }, []);

    useEffect(() => {
        if (!eventId || !currentUser) return;
        setLoading(true);
        
        Promise.all([
            axios.get(`/events/${eventId}/`),
            axios.get(`/registrations/?event=${eventId}&user=${currentUser.id}`)
        ])
        .then(([eventRes, regsRes]) => {
            setEvent(eventRes.data);
            const payload = regsRes.data;
            const items = Array.isArray(payload) ? payload : (payload.results || []);
            setRegistrations(items);
            
            // Load participants if user is admin
            const isEventAdmin = eventRes.data.admins?.includes(currentUser.id) || currentUser.role === 'admin';
            if (isEventAdmin) {
                loadParticipants();
            }
        })
        .catch(err => console.error('Error loading event details:', err))
        .finally(() => setLoading(false));
    }, [eventId, currentUser]);

    function createRegistration() {
        if (!currentUser) {
            alert('No se pudo obtener el usuario actual');
            return;
        }
        
        // Check personal limit
        const myRegistrations = registrations.filter(r => r.user?.id === currentUser.id);
        if (event.max_qr_codes && myRegistrations.length >= event.max_qr_codes) {
            alert(`Límite alcanzado: Solo puedes solicitar ${event.max_qr_codes} QR code(s) para este evento. Ya tienes ${myRegistrations.length}.`);
            return;
        }

        // Advertencia de precio si el evento es de pago
        if (event.price && parseFloat(event.price) > 0) {
            const confirmPayment = window.confirm(
                `Este evento tiene un costo de $${parseFloat(event.price).toFixed(2)}. ` +
                `Se deducirá de tu billetera. ¿Deseas continuar?`
            );
            if (!confirmPayment) return;
        }

        axios.post('/registrations/', { event: eventId, user: currentUser.id })
            .then(res => {
                setRegistrations(prev => [res.data, ...prev]);
                const message = event.price && parseFloat(event.price) > 0 
                    ? `Registro completado. Pago de $${parseFloat(event.price).toFixed(2)} realizado. Revisa tu correo para el ticket.`
                    : 'Registro creado exitosamente. Revisa tu correo para el ticket.';
                alert(message);
            })
            .catch(err => {
                console.error('Error creating registration:', err.response?.data || err.message);
                const errorMsg = err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message;
                alert('Error al crear registro: ' + errorMsg);
            });
    }

    function deleteRegistration(regId) {
        if (!window.confirm('¿Estás seguro de eliminar esta inscripción? Esta acción no se puede deshacer.')) {
            return;
        }
        
        axios.delete(`/registrations/${regId}/`)
            .then(() => {
                setRegistrations(prev => prev.filter(r => r.id !== regId));
                alert('Inscripción eliminada correctamente.');
            })
            .catch(err => {
                console.error('Error deleting registration:', err.response?.data || err.message);
                alert('Error al eliminar inscripción: ' + (err.response?.data?.detail || err.message));
            });
    }

    function addAdmin() {
        if (!newAdminEmail.trim()) {
            alert('Por favor ingresa un email');
            return;
        }

        // Find user by email first
        axios.get(`/users/?email=${encodeURIComponent(newAdminEmail)}`)
            .then(res => {
                const users = Array.isArray(res.data) ? res.data : (res.data.results || []);
                if (users.length === 0) {
                    alert('Usuario no encontrado con ese email');
                    return;
                }
                const user = users[0];
                
                // Add user as admin to event
                return axios.post(`/events/${eventId}/add_admin/`, { user_id: user.id });
            })
            .then(() => {
                // Reload event to get updated admins list
                return axios.get(`/events/${eventId}/`);
            })
            .then(res => {
                setEvent(res.data);
                setNewAdminEmail('');
                setShowAddAdmin(false);
                alert('Admin agregado exitosamente');
            })
            .catch(err => {
                console.error('Error adding admin:', err.response?.data || err.message);
                alert('Error al agregar admin: ' + (err.response?.data?.detail || err.message));
            });
    }

    function removeAdmin(userId) {
        if (!window.confirm('¿Estás seguro de remover este admin?')) {
            return;
        }

        axios.post(`/events/${eventId}/remove_admin/`, { user_id: userId })
            .then(() => {
                // Reload event to get updated admins list
                return axios.get(`/events/${eventId}/`);
            })
            .then(res => {
                setEvent(res.data);
                alert('Admin removido exitosamente');
            })
            .catch(err => {
                console.error('Error removing admin:', err.response?.data || err.message);
                alert('Error al remover admin: ' + (err.response?.data?.detail || err.message));
            });
    }

    function loadParticipants() {
        axios.get(`/events/${eventId}/participants/`)
            .then(res => setParticipants(res.data))
            .catch(err => console.error('Error loading participants:', err));
    }

    function removeParticipant(userId, userName) {
        if (!window.confirm(`¿Eliminar a ${userName} del evento? Se eliminarán todas sus inscripciones.`)) return;
        axios.post(`/events/${eventId}/remove_participant/`, { user_id: userId })
            .then(() => {
                alert('Participante eliminado del evento');
                loadParticipants();
                // Reload registrations
                axios.get(`/registrations/?event=${eventId}&user=${currentUser.id}`)
                    .then(res => {
                        const payload = res.data;
                        const items = Array.isArray(payload) ? payload : (payload.results || []);
                        setRegistrations(items);
                    });
            })
            .catch(err => alert('Error: ' + (err.response?.data?.detail || err.message)));
    }

    const isEventAdmin = currentUser && event && (
        currentUser.is_staff || 
        (event.admins && event.admins.some(admin => admin.id === currentUser.id))
    );

    if (loading) return <div className="container"><p>Cargando...</p></div>;
    if (!event) return <div className="container"><p>Evento no encontrado</p></div>;

    const qrLimit = event.max_qr_codes || 'Ilimitado';
    const myQrCount = currentUser ? registrations.filter(r => r.user?.id === currentUser.id).length : 0;
    const canRequestMore = !event.max_qr_codes || myQrCount < event.max_qr_codes;

    return (
        <div className="container">
            <button className="btn secondary" onClick={onBack} style={{marginBottom:12}}>← Volver a eventos</button>
            
            <div className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div style={{flex:1}}>
                        <h2 style={{marginTop:0}}>{event.name}</h2>
                        <div className="muted">{event.date ? new Date(event.date).toLocaleString() : 'Fecha desconocida'}</div>
                    </div>
                    {event.group && onViewGroup && (
                        <button 
                            className="btn secondary" 
                            onClick={() => onViewGroup(event.group)}
                            style={{fontSize:'14px',padding:'8px 16px'}}
                        >
                            👥 Ver Grupo
                        </button>
                    )}
                </div>
                {event.group_name && (
                    <div style={{marginBottom:12,padding:8,backgroundColor:'#f0f9ff',borderRadius:4,border:'1px solid #bae6fd'}}>
                        <strong>📂 Grupo:</strong> {event.group_name}
                    </div>
                )}
                {event.description && <p>{event.description}</p>}
                <div style={{marginTop:10}}>
                    <strong>Ubicación:</strong> {event.location || 'No especificada'}
                </div>
                <div>
                    <strong>Capacidad:</strong> {event.capacity || 'Ilimitada'}
                </div>
                <div>
                    <strong>Límite de QR por persona:</strong> {qrLimit}
                </div>
                <div>
                    <strong>Precio:</strong> {event.price && parseFloat(event.price) > 0 ? `$${parseFloat(event.price).toFixed(2)}` : 'GRATIS'}
                </div>
                <div>
                    <strong>Visibilidad:</strong> {event.is_public ? '🌍 Público' : '🔒 Privado (solo miembros del grupo)'}
                </div>
                
                {/* Mostrar admins del evento */}
                {event.admins && event.admins.length > 0 && (
                    <div style={{marginTop:16,padding:12,backgroundColor:'#fef3c7',borderRadius:6,border:'1px solid #fbbf24'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                            <strong>👑 Administradores del evento:</strong>
                            {isEventAdmin && (
                                <button 
                                    className="btn secondary" 
                                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                                    style={{fontSize:'12px',padding:'4px 8px'}}
                                >
                                    {showAddAdmin ? 'Cancelar' : '+ Agregar Admin'}
                                </button>
                            )}
                        </div>
                        
                        {showAddAdmin && (
                            <div style={{marginBottom:12,padding:8,backgroundColor:'white',borderRadius:4}}>
                                <input 
                                    type="email"
                                    placeholder="Email del usuario"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    style={{marginRight:8,padding:'6px 10px',borderRadius:4,border:'1px solid #ddd',flex:1}}
                                />
                                <button className="btn" onClick={addAdmin} style={{fontSize:'12px',padding:'6px 12px'}}>
                                    Agregar
                                </button>
                            </div>
                        )}
                        
                        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                            {event.admins.map(admin => (
                                <div key={admin.id} style={{
                                    display:'flex',
                                    alignItems:'center',
                                    gap:6,
                                    padding:'6px 12px',
                                    backgroundColor:'white',
                                    borderRadius:4,
                                    fontSize:'13px'
                                }}>
                                    <span>{admin.username}</span>
                                    <span className="muted" style={{fontSize:'11px'}}>({admin.email})</span>
                                    {isEventAdmin && event.admins.length > 1 && admin.id !== currentUser?.id && (
                                        <button 
                                            onClick={() => removeAdmin(admin.id)}
                                            style={{
                                                marginLeft:4,
                                                padding:'2px 6px',
                                                fontSize:'11px',
                                                backgroundColor:'#fee2e2',
                                                border:'1px solid #fca5a5',
                                                borderRadius:3,
                                                cursor:'pointer'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Mostrar participantes del evento (solo para admins) */}
                {isEventAdmin && participants.length > 0 && (
                    <div style={{marginTop:16,padding:12,backgroundColor:'#f0f9ff',borderRadius:6,border:'1px solid #93c5fd'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                            <strong>👥 Participantes ({participants.length}):</strong>
                            <button 
                                className="btn secondary" 
                                onClick={() => setShowParticipants(!showParticipants)}
                                style={{fontSize:'12px',padding:'4px 8px'}}
                            >
                                {showParticipants ? 'Ocultar' : 'Ver Participantes'}
                            </button>
                        </div>
                        
                        {showParticipants && (
                            <div style={{display:'grid',gap:8,marginTop:8}}>
                                {participants.map(participant => (
                                    <div key={participant.id} style={{
                                        display:'flex',
                                        alignItems:'center',
                                        justifyContent:'space-between',
                                        padding:'8px 12px',
                                        backgroundColor:'white',
                                        borderRadius:4,
                                        fontSize:'13px'
                                    }}>
                                        <div>
                                            <span style={{fontWeight:'500'}}>{participant.username}</span>
                                            <span className="muted" style={{fontSize:'11px',marginLeft:8}}>({participant.email})</span>
                                        </div>
                                        {participant.id !== currentUser?.id && (
                                            <button 
                                                onClick={() => removeParticipant(participant.id, participant.username)}
                                                style={{
                                                    padding:'4px 10px',
                                                    fontSize:'11px',
                                                    backgroundColor:'#fee2e2',
                                                    border:'1px solid #fca5a5',
                                                    borderRadius:3,
                                                    cursor:'pointer'
                                                }}
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
            </div>

            {event.group && (
                <div className="card" style={{marginTop:20,textAlign:'center',padding:'30px',backgroundColor:'#fef3c7',border:'1px solid #fbbf24'}}>
                    <div style={{fontSize:'32px',marginBottom:'12px'}}>🎫</div>
                    <h3 style={{margin:'0 0 8px 0'}}>¿Quieres asistir a este evento?</h3>
                    <p style={{margin:'0 0 16px 0',color:'#92400e',fontSize:'14px'}}>
                        Este evento pertenece a un grupo. Para solicitar tu QR de entrada, debes acceder al grupo desde la sección "Mis Grupos".
                    </p>
                    <div style={{fontSize:'12px',color:'#78350f',fontStyle:'italic'}}>
                        Los códigos QR se gestionan desde el grupo para mejor organización
                    </div>
                </div>
            )}
            
            {!event.group && (
                <div className="card" style={{marginTop:20,textAlign:'center',padding:'30px',backgroundColor:'#f0f9ff',border:'1px solid #3b82f6'}}>
                    <div style={{fontSize:'32px',marginBottom:'12px'}}>ℹ️</div>
                    <h3 style={{margin:'0 0 8px 0'}}>Evento Público</h3>
                    <p style={{margin:0,color:'#1e40af',fontSize:'14px'}}>
                        Este es un evento público. Consulta con los organizadores para más información sobre cómo asistir.
                    </p>
                </div>
            )}
        </div>
    );
}
