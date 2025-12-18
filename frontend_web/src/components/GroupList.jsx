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
            <div style={{marginBottom:'28px'}}>
                <h1 style={{margin:'0 0 8px 0',fontSize:'28px',fontWeight:'700'}}>👥 Mis Grupos</h1>
                <p style={{margin:'0 0 20px 0',color:'var(--muted)'}}>Gestiona tus grupos, crea eventos y asigna permisos a miembros.</p>
                <button 
                    className="btn" 
                    onClick={()=>{setShowCreate(!showCreate); setEditingId(null);}}
                    style={{
                        display:'flex',
                        alignItems:'center',
                        gap:'8px',
                        padding:'12px 20px',
                        fontSize:'15px',
                        fontWeight:'600'
                    }}
                >
                    {showCreate ? '✕ Cancelar' : '+ Crear Nuevo Grupo'}
                </button>
            </div>

            {/* Formulario de creación */}
            {showCreate && (
                <div className="group-form-wrapper">
                    <h2 style={{margin:'0 0 8px 0',fontSize:'24px',fontWeight:'700',color:'white'}}>✨ Crear Nuevo Grupo</h2>
                    <p style={{margin:'0 0 24px 0',opacity:0.95,fontSize:'14px'}}>
                        Crea un grupo para organizar eventos y gestionar miembros
                    </p>
                    <div className="group-form-content">
                        <GroupForm onSaved={()=>{setShowCreate(false); load();}} />
                    </div>
                </div>
            )}

            {/* Formulario de edición */}
            {editingId && (
                <div className="group-form-wrapper edit-mode">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                        <h2 style={{margin:0,fontSize:'24px',fontWeight:'700',color:'white'}}>✏️ Editar Grupo</h2>
                        <button 
                            onClick={()=>setEditingId(null)}
                            style={{
                                background:'rgba(255,255,255,0.2)',
                                border:'none',
                                color:'white',
                                padding:'8px 16px',
                                borderRadius:'8px',
                                cursor:'pointer',
                                fontWeight:'600',
                                fontSize:'14px'
                            }}
                        >
                            ✕ Cancelar
                        </button>
                    </div>
                    <p style={{margin:'0 0 24px 0',opacity:0.95,fontSize:'14px'}}>
                        Modifica la información del grupo
                    </p>
                    <div className="group-form-content">
                        <GroupForm groupId={editingId} onSaved={()=>{setEditingId(null); load();}} />
                    </div>
                </div>
            )}

            {/* Lista de grupos */}
            {groups.length === 0 ? (
                <div className="card" style={{textAlign:'center',padding:'60px 40px'}}>
                    <div style={{fontSize:'48px',marginBottom:'16px'}}>📂</div>
                    <h3 style={{margin:'0 0 8px 0',color:'var(--muted)'}}>No tienes grupos aún</h3>
                    <p style={{margin:'0 0 20px 0',color:'var(--muted)',fontSize:'14px'}}>
                        Crea tu primer grupo para comenzar a organizar eventos y miembros.
                    </p>
                    <button 
                        className="btn" 
                        onClick={()=>setShowCreate(true)}
                        style={{padding:'12px 24px'}}
                    >
                        Crear Primer Grupo
                    </button>
                </div>
            ) : (
                <div className="grid">
                    {groups.map(g => (
                        <div className="card" key={g.id} style={{
                            position:'relative',
                            transition:'all 0.3s ease',
                            border:'1px solid #e2e8f0'
                        }}>
                            <div style={{marginBottom:'16px'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
                                    <h3 style={{margin:'0 0 8px 0',fontSize:'20px',fontWeight:'700',color:'#1e293b'}}>
                                        {g.name}
                                    </h3>
                                    <button 
                                        style={{
                                            background:'#fee2e2',
                                            border:'none',
                                            color:'#991b1b',
                                            width:'32px',
                                            height:'32px',
                                            borderRadius:'8px',
                                            cursor:'pointer',
                                            fontSize:'18px',
                                            fontWeight:'700',
                                            display:'flex',
                                            alignItems:'center',
                                            justifyContent:'center',
                                            transition:'all 0.2s'
                                        }}
                                        onClick={()=>deleteGroup(g.id, g.name)} 
                                        title="Eliminar grupo"
                                        onMouseEnter={(e) => {e.target.style.background='#dc2626'; e.target.style.color='white'}}
                                        onMouseLeave={(e) => {e.target.style.background='#fee2e2'; e.target.style.color='#991b1b'}}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div style={{
                                    display:'inline-flex',
                                    alignItems:'center',
                                    gap:'4px',
                                    padding:'4px 12px',
                                    background:'#f0f9ff',
                                    borderRadius:'12px',
                                    fontSize:'13px',
                                    color:'#0369a1',
                                    fontWeight:'600'
                                }}>
                                    <span>👤</span>
                                    <span>{Array.isArray(g.members) ? g.members.length : 0} miembros</span>
                                </div>
                            </div>
                            <div style={{display:'flex',gap:'8px',marginTop:'16px'}}>
                                <button 
                                    className="btn secondary" 
                                    onClick={()=>setEditingId(g.id)}
                                    style={{flex:1,fontSize:'14px',padding:'10px'}}
                                >
                                    ✏️ Editar
                                </button>
                                <button 
                                    className="btn" 
                                    onClick={()=>setSelectedGroupId(g.id)}
                                    style={{flex:1,fontSize:'14px',padding:'10px'}}
                                >
                                    🎯 Gestionar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
