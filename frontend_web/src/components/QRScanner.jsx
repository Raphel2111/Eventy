import React, { useState } from 'react';
import axios from '../api';

export default function QRScanner({ eventId, onBack }) {
    const [scannedCode, setScannedCode] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    function validateQR(e) {
        e.preventDefault();
        if (!scannedCode.trim()) {
            setError('Ingresa un código para validar');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        // Find registration by entry_code
        axios.get(`registrations/?event=${eventId}`)
            .then(res => {
                const payload = res.data;
                const items = Array.isArray(payload) ? payload : (payload.results || []);
                const registration = items.find(r => r.entry_code === scannedCode.trim());

                if (!registration) {
                    setError('Código QR no encontrado para este evento');
                    setLoading(false);
                    return;
                }

                // Validate the QR
                return axios.post(`registrations/${registration.id}/validate_qr/`);
            })
            .then(res => {
                if (res) {
                    setResult(res.data);
                    setScannedCode('');
                }
            })
            .catch(err => {
                console.error('Error validating QR:', err.response?.data || err.message);
                setError(err.response?.data?.detail || 'Error al validar QR');
            })
            .finally(() => setLoading(false));
    }

    return (
        <div className="container">
            <button className="btn secondary" onClick={onBack} style={{marginBottom:12}}>← Volver</button>
            
            <div className="card">
                <h2 style={{marginTop:0}}>Escanear QR de Asistente</h2>
                <p className="muted">Ingresa o escanea el código del QR del usuario para validar su entrada.</p>

                <form onSubmit={validateQR} style={{marginTop:20}}>
                    <div className="form-row">
                        <label>Código QR</label>
                        <input 
                            type="text" 
                            value={scannedCode} 
                            onChange={e => setScannedCode(e.target.value)}
                            placeholder="Escanea o pega el código aquí"
                            autoFocus
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Validando...' : 'Validar QR'}
                    </button>
                </form>

                {error && (
                    <div style={{
                        marginTop:20,
                        padding:12,
                        background:'#fee',
                        border:'1px solid var(--danger)',
                        borderRadius:8,
                        color:'var(--danger)'
                    }}>
                        <strong>❌ Error:</strong> {error}
                    </div>
                )}

                {result && (
                    <div style={{
                        marginTop:20,
                        padding:12,
                        background: result.already_used ? '#fff3cd' : '#d4edda',
                        border: result.already_used ? '1px solid #ffc107' : '1px solid #28a745',
                        borderRadius:8
                    }}>
                        <strong>{result.already_used ? '⚠️ QR Ya Usado' : '✅ QR Validado'}</strong>
                        <div style={{marginTop:10}}>
                            <div><strong>Usuario:</strong> {result.registration?.user?.username || 'Desconocido'}</div>
                            <div><strong>Email:</strong> {result.registration?.user?.email || 'N/A'}</div>
                            <div><strong>Código:</strong> <code>{result.registration?.entry_code}</code></div>
                            <div style={{marginTop:8}}>
                                {result.already_used ? 
                                    'Este QR ya había sido validado anteriormente.' : 
                                    'Entrada validada exitosamente. El usuario puede ingresar al evento.'
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="card" style={{marginTop:20}}>
                <h3>Instrucciones</h3>
                <ul>
                    <li>Pide al asistente que muestre su QR personal</li>
                    <li>Escanea el código o ingresa el texto manualmente</li>
                    <li>El sistema validará automáticamente el QR y lo marcará como usado</li>
                    <li>Si el QR ya fue usado, recibirás una advertencia</li>
                </ul>
            </div>
        </div>
    );
}
