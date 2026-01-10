import React, { useEffect, useState } from 'react';
import axios from '../api';
import EventAccessManager from '../components/EventAccessManager';
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

    // Guest Registration State
    const [isGuestRegistration, setIsGuestRegistration] = useState(false);
    const [guestData, setGuestData] = useState({
        first_name: '',
        last_name: '',
        type: 'member'
    });

    useEffect(() => {
        fetchCurrentUser().then(u => setCurrentUser(u));
    }, []);

    useEffect(() => {
        if (!eventId || !currentUser) return;
        setLoading(true);

        Promise.all([
            axios.get(`events/${eventId}/`),
            axios.get(`registrations/?event=${eventId}&user=${currentUser.id}`)
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

        // Validate guest data if checked
        if (isGuestRegistration) {
            if (!guestData.first_name.trim() || !guestData.last_name.trim()) {
                alert('Por favor ingresa el nombre y apellidos del invitado.');
                return;
            }
        }

        // Check personal limit
        const myRegistrations = registrations.filter(r => r.user?.id === currentUser.id);
        if (event.max_qr_codes && myRegistrations.length >= event.max_qr_codes) {
            alert(`Límite alcanzado: Solo puedes solicitar ${event.max_qr_codes} QR code(s) para este evento. Ya tienes ${myRegistrations.length}.`);
            return;
        }

        const payload = {
            event: eventId,
            user: currentUser.id
        };

        if (isGuestRegistration) {
            payload.attendee_first_name = guestData.first_name;
            payload.attendee_last_name = guestData.last_name;
            payload.attendee_type = guestData.type;
        }

        // Advertencia de precio si el evento es de pago
        let confirmMsg = '';
        if (event.price && parseFloat(event.price) > 0) {
            confirmMsg = `Este evento tiene un costo de $${parseFloat(event.price).toFixed(2)}. Se deducirá de tu billetera.`;
        }

        if (isGuestRegistration) {
            confirmMsg += confirmMsg ? '\n\n' : '';
            confirmMsg += `Estás registrando a: ${guestData.first_name} ${guestData.last_name} (${guestData.type === 'child' ? 'Niño' : guestData.type === 'guest' ? 'Invitado' : 'Fallero'}).`;
        }

        if (confirmMsg) {
            if (!window.confirm(`${confirmMsg}\n\n¿Deseas continuar?`)) return;
        }

        axios.post('registrations/', payload)
            .then(res => {
                setRegistrations(prev => [res.data, ...prev]);
                const message = event.price && parseFloat(event.price) > 0
                    ? `Registro completado. Pago realizado. Revisa tu correo para el ticket.`
                    : 'Registro creado exitosamente. Revisa tu correo para el ticket.';
                alert(message);
                // Reset form
                setIsGuestRegistration(false);
                setGuestData({ first_name: '', last_name: '', type: 'member' });
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

        axios.delete(`registrations/${regId}/`)
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
        axios.get(`users/?email=${encodeURIComponent(newAdminEmail)}`)
            .then(res => {
                const users = Array.isArray(res.data) ? res.data : (res.data.results || []);
                if (users.length === 0) {
                    alert('Usuario no encontrado con ese email');
                    return;
                }
                const user = users[0];

                // Add user as admin to event
                return axios.post(`events/${eventId}/add_admin/`, { user_id: user.id });
            })
            .then(() => {
                // Reload event to get updated admins list
                return axios.get(`events/${eventId}/`);
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

        axios.post(`events/${eventId}/remove_admin/`, { user_id: userId })
            .then(() => {
                // Reload event to get updated admins list
                return axios.get(`events/${eventId}/`);
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
        axios.get(`events/${eventId}/participants/`)
            .then(res => setParticipants(res.data))
            .catch(err => console.error('Error loading participants:', err));
    }

    function removeParticipant(userId, userName) {
        if (!window.confirm(`¿Eliminar a ${userName} del evento? Se eliminarán todas sus inscripciones.`)) return;
        axios.post(`events/${eventId}/remove_participant/`, { user_id: userId })
            .then(() => {
                alert('Participante eliminado del evento');
                loadParticipants();
                // Reload registrations
                axios.get(`registrations/?event=${eventId}&user=${currentUser.id}`)
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

    function exportRegistrations() {
        if (!confirm('¿Descargar lista de participantes en Excel (CSV)?')) return;

        axios.get(`events/${eventId}/export_registrations/`, { responseType: 'blob' })
            .then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `participantes_${eventId}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(err => {
                console.error('Export error:', err);
                alert('Error al exportar: ' + (err.response?.status === 403 ? 'No tienes permisos' : 'Error del servidor'));
            });
    }

    if (loading) return <div className="container"><p>Cargando...</p></div>;
    if (!event) return <div className="container"><p>Evento no encontrado</p></div>;

    const qrLimit = event.max_qr_codes || 'Ilimitado';
    const myQrCount = currentUser ? registrations.filter(r => r.user?.id === currentUser.id).length : 0;
    const canRequestMore = !event.max_qr_codes || myQrCount < event.max_qr_codes;

    return (
        <div className="container">
            <button className="btn secondary" onClick={onBack} style={{ marginBottom: 12 }}>← Volver a eventos</button>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ marginTop: 0 }}>{event.name}</h2>
                        <div className="muted">{event.date ? new Date(event.date).toLocaleString() : 'Fecha desconocida'}</div>
                    </div>
                    {event.group && onViewGroup && (
                        <button
                            className="btn secondary"
                            onClick={() => onViewGroup(event.group)}
                            style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                            👥 Ver Grupo
                        </button>
                    )}
                </div>
                {event.group_name && (
                    <div style={{ marginBottom: 12, padding: 8, backgroundColor: '#f0f9ff', borderRadius: 4, border: '1px solid #bae6fd' }}>
                        <strong>📂 Grupo:</strong> {event.group_name}
                    </div>
                )}
                {event.description && <p>{event.description}</p>}
                <div style={{ marginTop: 10 }}>
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
                {event.registration_deadline && (
                    <div style={{ color: new Date() > new Date(event.registration_deadline) ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                        <strong>⏳ Cierre inscripción:</strong> {new Date(event.registration_deadline).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}

                {/* Mostrar admins del evento */}
                {event.admins && event.admins.length > 0 && (
                    <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fbbf24' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <strong>👑 Administradores del evento:</strong>
                            {isEventAdmin && (
                                <button
                                    className="btn secondary"
                                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                >
                                    {showAddAdmin ? 'Cancelar' : '+ Agregar Admin'}
                                </button>
                            )}
                        </div>

                        {showAddAdmin && (
                            <div style={{ marginBottom: 12, padding: 8, backgroundColor: 'white', borderRadius: 4 }}>
                                <input
                                    type="email"
                                    placeholder="Email del usuario"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    style={{ marginRight: 8, padding: '6px 10px', borderRadius: 4, border: '1px solid #ddd', flex: 1 }}
                                />
                                <button className="btn" onClick={addAdmin} style={{ fontSize: '12px', padding: '6px 12px' }}>
                                    Agregar
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {event.admins.map(admin => (
                                <div key={admin.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '6px 12px',
                                    backgroundColor: 'white',
                                    borderRadius: 4,
                                    fontSize: '13px'
                                }}>
                                    <span>{admin.username}</span>
                                    <span className="muted" style={{ fontSize: '11px' }}>({admin.email})</span>
                                    {isEventAdmin && event.admins.length > 1 && admin.id !== currentUser?.id && (
                                        <button
                                            onClick={() => removeAdmin(admin.id)}
                                            style={{
                                                marginLeft: 4,
                                                padding: '2px 6px',
                                                fontSize: '11px',
                                                backgroundColor: '#fee2e2',
                                                border: '1px solid #fca5a5',
                                                borderRadius: 3,
                                                cursor: 'pointer'
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
                {isEventAdmin && (
                    <EventAccessManager event={event} currentUser={currentUser} />
                )}

            </div>

            {event.group && (
                <div className="card" style={{ marginTop: 20, textAlign: 'center', padding: '30px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎫</div>
                    <h3 style={{ margin: '0 0 8px 0' }}>¿Quieres asistir a este evento?</h3>
                    <p style={{ margin: '0 0 16px 0', color: '#92400e', fontSize: '14px' }}>
                        Este evento pertenece a un grupo. Para solicitar tu QR de entrada, debes acceder al grupo desde la sección "Mis Grupos".
                    </p>
                    <div style={{ fontSize: '12px', color: '#78350f', fontStyle: 'italic' }}>
                        Los códigos QR se gestionan desde el grupo para mejor organización
                    </div>
                </div>
            )}

            {!event.group && (
                <div className="card" style={{ marginTop: 20, textAlign: 'center', padding: '30px', backgroundColor: '#f0f9ff', border: '1px solid #3b82f6' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                        {canRequestMore ? '🎫' : '✅'}
                    </div>
                    <h3 style={{ margin: '0 0 8px 0' }}>Asistencia al Evento</h3>

                    {event.registration_deadline && new Date() > new Date(event.registration_deadline) ? (
                        <div style={{ color: '#dc2626', fontWeight: 'bold', padding: '10px' }}>
                            🚫 Las inscripciones para este evento han cerrado.
                        </div>
                    ) : (
                        <>
                            {!canRequestMore ? (
                                <p style={{ margin: 0, color: '#059669', fontSize: '14px', fontWeight: 'bold' }}>
                                    ✅ Ya estás inscrito en este evento (Límite alcanzado).
                                </p>
                            ) : (
                                <>
                                    <p style={{ margin: '0 0 16px 0', color: '#1e40af', fontSize: '14px' }}>
                                        {event.price && parseFloat(event.price) > 0
                                            ? `El costo de entrada es $${parseFloat(event.price).toFixed(2)}. Se descontará de tu billetera.`
                                            : 'Este evento es gratuito. ¡Inscríbete para obtener tu QR!'}
                                    </p>

                                    {/* Guest Registration Form */}
                                    <div style={{ marginBottom: 16, padding: 12, border: '1px solid #cbd5e1', borderRadius: 8, backgroundColor: 'white' }}>
                                        <div style={{ marginBottom: 8 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isGuestRegistration}
                                                    onChange={(e) => setIsGuestRegistration(e.target.checked)}
                                                    style={{ marginRight: 8 }}
                                                />
                                                Inscribir a otra persona (Invitado / Familiar)
                                            </label>
                                        </div>

                                        {isGuestRegistration && (
                                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                                                    <div>
                                                        <label style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>Nombre</label>
                                                        <input
                                                            type="text"
                                                            value={guestData.first_name}
                                                            onChange={(e) => setGuestData({ ...guestData, first_name: e.target.value })}
                                                            style={{ width: '100%', padding: '6px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>Apellidos</label>
                                                        <input
                                                            type="text"
                                                            value={guestData.last_name}
                                                            onChange={(e) => setGuestData({ ...guestData, last_name: e.target.value })}
                                                            style={{ width: '100%', padding: '6px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>Tipo de asistente</label>
                                                    <select
                                                        value={guestData.type}
                                                        onChange={(e) => setGuestData({ ...guestData, type: e.target.value })}
                                                        style={{ width: '100%', padding: '6px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                                                    >
                                                        <option value="member">Fallero (Miembro)</option>
                                                        <option value="guest">Invitado</option>
                                                        <option value="child">Niño / Infantil</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="btn"
                                        onClick={createRegistration}
                                        style={{ fontSize: '1.1em', padding: '10px 24px' }}
                                    >
                                        {event.price && parseFloat(event.price) > 0 ? 'Pagar e Inscribirse' : 'Confirmar Inscripción'}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
