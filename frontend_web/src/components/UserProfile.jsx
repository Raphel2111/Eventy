import React, { useState, useEffect } from 'react';
import axios from '../api';
import { getBackendUrl } from '../api';
import ProfileSettings from './ProfileSettings';

export default function UserProfile({ userId, onBack, showVerificationAlert, onClearAlert }) {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        bio: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadUser();
    }, [userId]);

    // Mostrar verificación automáticamente si se recibe la alerta
    useEffect(() => {
        if (showVerificationAlert) {
            setShowVerification(true);
        }
    }, [showVerificationAlert]);

    function loadUser() {
        setLoading(true);
        axios.get(`/users/${userId}/`)
            .then(res => {
                setUser(res.data);
                setFormData({
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                    bio: res.data.bio || ''
                });
            })
            .catch(err => console.error('Error loading user:', err))
            .finally(() => setLoading(false));
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }

    function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const formDataToSend = new FormData();
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('bio', formData.bio);
        
        if (avatarFile) {
            formDataToSend.append('avatar', avatarFile);
        }

        axios.patch(`/users/${userId}/`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(res => {
                setUser(res.data);
                setEditing(false);
                setAvatarFile(null);
                setAvatarPreview(null);
                alert('Perfil actualizado exitosamente');
            })
            .catch(err => {
                if (err.response?.data) {
                    setErrors(err.response.data);
                } else {
                    setErrors({ general: 'Error al actualizar perfil' });
                }
            })
            .finally(() => setSaving(false));
    }

    if (loading) {
        return (
            <div className="container">
                <div className="card">Cargando perfil...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container">
                <div className="card">Usuario no encontrado</div>
            </div>
        );
    }

    const avatarUrl = avatarPreview || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=200`;

    // Mostrar componente de verificación si está activado
    if (showVerification) {
        return <ProfileSettings onBack={() => {
            setShowVerification(false);
            if (onClearAlert) onClearAlert();
            loadUser(); // Recargar usuario después de verificar
        }} showAlert={showVerificationAlert} />;
    }

    return (
        <div className="container">
            {onBack && (
                <button className="btn secondary" onClick={onBack} style={{ marginBottom: 12 }}>
                    ← Volver
                </button>
            )}

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                    {/* Avatar */}
                    <div style={{ textAlign: 'center' }}>
                        <img 
                            src={avatarUrl} 
                            alt={user.username}
                            style={{ 
                                width: 150, 
                                height: 150, 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '3px solid var(--primary)'
                            }}
                        />
                        {editing && (
                            <div style={{ marginTop: 12 }}>
                                <label htmlFor="avatar-upload" className="btn secondary" style={{ cursor: 'pointer', fontSize: '0.9em' }}>
                                    Cambiar foto
                                </label>
                                <input 
                                    type="file" 
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <h2 style={{ marginTop: 0 }}>{user.username}</h2>
                        <div className="muted" style={{ marginBottom: 8 }}>
                            Rango: {user.role === 'admin' ? 'Administrador' : 'Asistente'}
                        </div>

                        {/* Estado de verificación */}
                        <div style={{ marginTop: 12, marginBottom: 12 }}>
                            <div style={{ 
                                display: 'inline-block', 
                                padding: '6px 12px', 
                                borderRadius: 'var(--radius)',
                                backgroundColor: user.email_verified ? '#10b981' : '#f59e0b',
                                color: 'white',
                                fontSize: '0.85em',
                                fontWeight: 600
                            }}>
                                {user.email_verified ? '✓ Email verificado' : '⚠ Email no verificado'}
                            </div>
                            {!user.email_verified && (
                                <button 
                                    className="btn" 
                                    onClick={() => setShowVerification(true)}
                                    style={{ marginLeft: 12, fontSize: '0.9em' }}
                                >
                                    Verificar ahora
                                </button>
                            )}
                        </div>

                        {!editing ? (
                            <>
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Email:</strong> {user.email || 'No especificado'}
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <strong>Teléfono:</strong> {user.phone || 'No especificado'}
                                    </div>
                                    {user.bio && (
                                        <div style={{ marginTop: 12 }}>
                                            <strong>Biografía:</strong>
                                            <p style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{user.bio}</p>
                                        </div>
                                    )}
                                </div>
                                <button className="btn" onClick={() => setEditing(true)} style={{ marginTop: 16 }}>
                                    Editar Perfil
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                                {errors.general && (
                                    <div style={{ padding: 12, backgroundColor: 'var(--danger)', color: 'white', borderRadius: 'var(--radius)', marginBottom: 16 }}>
                                        {errors.general}
                                    </div>
                                )}

                                <div className="form-row">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                    {errors.email && <div style={{ color: 'var(--danger)', fontSize: '0.85em' }}>{errors.email}</div>}
                                </div>

                                <div className="form-row">
                                    <label>Teléfono</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                    {errors.phone && <div style={{ color: 'var(--danger)', fontSize: '0.85em' }}>{errors.phone}</div>}
                                </div>

                                <div className="form-row">
                                    <label>Biografía</label>
                                    <textarea 
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={saving}
                                        rows={4}
                                        placeholder="Cuéntanos sobre ti..."
                                    />
                                    {errors.bio && <div style={{ color: 'var(--danger)', fontSize: '0.85em' }}>{errors.bio}</div>}
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="submit" className="btn" disabled={saving}>
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn secondary" 
                                        onClick={() => {
                                            setEditing(false);
                                            setAvatarFile(null);
                                            setAvatarPreview(null);
                                            setFormData({
                                                email: user.email || '',
                                                phone: user.phone || '',
                                                bio: user.bio || ''
                                            });
                                        }}
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
