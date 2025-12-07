import React, { useEffect, useState } from 'react';
import axios from '../api';
import EventDetail from './EventDetail';
import GroupDetail from './GroupDetail';
import { fetchCurrentUser } from '../auth';

export default function EventList(){
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchCurrentUser().then(u => setCurrentUser(u));
    }, []);

    useEffect(()=>{
        setLoading(true);
        axios.get('/events/')
            .then(res=>{
                const payload = res.data;
                const items = Array.isArray(payload) ? payload : (payload.results || []);
                setEvents(items);
            })
            .catch(()=>{})
            .finally(() => setLoading(false));
    },[]);

    function deleteEvent(eventId, eventName) {
        if (!window.confirm(`¿Estás seguro de eliminar el evento "${eventName}"? Esta acción no se puede deshacer y eliminará todas las inscripciones asociadas.`)) {
            return;
        }
        
        axios.delete(`/events/${eventId}/`)
            .then(() => {
                setEvents(prev => prev.filter(e => e.id !== eventId));
                alert('Evento eliminado correctamente.');
            })
            .catch(err => {
                console.error('Error deleting event:', err.response?.data || err.message);
                alert('Error al eliminar evento: ' + (err.response?.data?.detail || err.message));
            });
    }

    function isEventAdmin(event) {
        if (!currentUser) return false;
        if (currentUser.is_staff) return true;
        return event.admins && event.admins.some(admin => admin.id === currentUser.id);
    }

    if (selectedGroupId) {
        return <GroupDetail groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />;
    }

    if (selectedEventId) {
        return <EventDetail 
            eventId={selectedEventId} 
            onBack={() => setSelectedEventId(null)}
            onViewGroup={(groupId) => {
                setSelectedEventId(null);
                setSelectedGroupId(groupId);
            }}
        />;
    }

    if (loading) {
        return (
            <div className="container">
                <div className="card" style={{textAlign:'center',padding:'40px'}}>
                    <p style={{color:'var(--muted)'}}>Cargando eventos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{marginBottom:'28px'}}>
                <h1 style={{margin:'0 0 8px 0',fontSize:'28px',fontWeight:'700'}}>Eventos Disponibles</h1>
                <p style={{margin:0,color:'var(--muted)'}}>
                    {events.length} {events.length === 1 ? 'evento' : 'eventos'} encontrados
                </p>
            </div>

            {events.length === 0 ? (
                <div className="card" style={{textAlign:'center',padding:'40px'}}>
                    <div style={{fontSize:'32px',marginBottom:'12px'}}>📭</div>
                    <h3 style={{margin:'0 0 8px 0',color:'var(--muted)'}}>Sin eventos disponibles</h3>
                    <p style={{margin:0,color:'var(--muted)',fontSize:'14px'}}>Por el momento no hay eventos disponibles. Vuelve más tarde.</p>
                </div>
            ) : (
                <div className="grid">
                    {events.map(ev => (
                        <div className="card event-card" key={ev.id}>
                            <div style={{flex:1}}>
                                <h3 style={{fontSize:'18px',fontWeight:'600'}}>{ev.name}</h3>
                                <p className="muted" style={{marginBottom:'12px'}}>
                                    📅 {ev.date ? new Date(ev.date).toLocaleDateString('es-ES', {year:'numeric',month:'long',day:'numeric'}) : 'Fecha desconocida'}
                                </p>
                                {ev.location && (
                                    <p className="muted" style={{marginBottom:'12px',fontSize:'14px'}}>
                                        📍 {ev.location}
                                    </p>
                                )}
                                {ev.group_name && (
                                    <p style={{marginBottom:'12px',fontSize:'14px',color:'#2563eb',fontWeight:500}}>
                                        📂 Grupo: {ev.group_name}
                                    </p>
                                )}
                                {ev.description && (
                                    <p style={{
                                        marginTop:0,
                                        marginBottom:'16px',
                                        fontSize:'14px',
                                        lineHeight:'1.5',
                                        color:'#334155'
                                    }}>
                                        {ev.description.substring(0, 120)}
                                        {ev.description.length > 120 ? '...' : ''}
                                    </p>
                                )}
                                {ev.capacity && (
                                    <p className="muted" style={{fontSize:'12px'}}>
                                        👥 Capacidad: {ev.capacity}
                                    </p>
                                )}
                            </div>
                            <div style={{display:'flex',gap:8,marginTop:'12px'}}>
                                <button className="btn" onClick={() => setSelectedEventId(ev.id)} style={{flex:1}}>
                                    Ver Detalles
                                </button>
                                {isEventAdmin(ev) && (
                                    <button onClick={() => deleteEvent(ev.id, ev.name)} className="btn" style={{backgroundColor:'#ef4444',borderColor:'#dc2626',padding:'8px 16px'}}>
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
