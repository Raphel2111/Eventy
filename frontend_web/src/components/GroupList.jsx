import React, { useEffect, useState } from 'react';
import axios from '../api';
import GroupForm from './GroupForm';
import GroupDetail from './GroupDetail';

export default function GroupList(){
    const [groups,setGroups] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    useEffect(()=>{ load(); },[]);

    function load(){
        axios.get('/groups/')
            .then(res => {
                const payload = res.data;
                const items = Array.isArray(payload) ? payload : (payload.results || []);
                setGroups(items);
            })
            .catch(err => console.error('Failed to load groups', err));
    }

    function deleteGroup(id, name){
        if(!window.confirm(`¿Eliminar el grupo "${name}"? Esta acción no se puede deshacer.`)) return;
        axios.delete(`/groups/${id}/`)
            .then(() => {
                load();
                if(editingId === id) setEditingId(null);
            })
            .catch(err => {
                console.error('Error deleting group:', err.response?.data || err.message);
                alert('Error al eliminar: ' + (err.response?.data?.detail || err.message));
            });
    }

    if (selectedGroupId) {
        return <GroupDetail groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />;
    }

    return (
        <div className="container">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h2 style={{margin:0}}>Mis Grupos</h2>
                <div>
                    <button className="btn" onClick={()=>{setShowCreate(true); setEditingId(null);}}>Crear Grupo</button>
                </div>
            </div>
            <p className="muted">Gestiona tus grupos, crea eventos y asigna permisos a miembros.</p>

            {groups.length === 0 ? (
                <div className="card">No hay grupos. Crea tu primer grupo.</div>
            ) : (
                <div className="grid">
                    {groups.map(g => (
                        <div className="card" key={g.id}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                                <div>
                                    <strong>{g.name}</strong>
                                    <div className="muted">Miembros: {Array.isArray(g.members) ? g.members.length : 0}</div>
                                </div>
                                <button className="btn" style={{background:'var(--danger)',fontSize:'0.85em',padding:'4px 8px'}} onClick={()=>deleteGroup(g.id, g.name)} title="Eliminar grupo">×</button>
                            </div>
                            <div style={{display:'flex',gap:8}}>
                                <button className="btn secondary" onClick={()=>setEditingId(g.id)}>Editar</button>
                                <button className="btn" onClick={()=>setSelectedGroupId(g.id)}>Gestionar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && <div style={{marginTop:12}} className="card"><h3>Crear Grupo</h3><GroupForm onSaved={()=>{setShowCreate(false); load();}} /></div>}
            {editingId && <div style={{marginTop:12}} className="card"><h3>Editar Grupo</h3><GroupForm groupId={editingId} onSaved={()=>{setEditingId(null); load();}} /></div>}
        </div>
    );
}
