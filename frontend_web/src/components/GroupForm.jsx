import React, { useEffect, useState } from 'react';
import axios from '../api';
import Select from 'react-select';

export default function GroupForm({ groupId, onSaved }){
    const [name, setName] = useState('');
    const [members, setMembers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [events, setEvents] = useState([]);

    const [allUsers, setAllUsers] = useState([]);
    const [allEvents, setAllEvents] = useState([]);

    useEffect(()=>{
        axios.get('/users/for_select/').then(res=>{
            const payload = res.data;
            const arr = Array.isArray(payload) ? payload : (payload.results || payload || []);
            const opts = arr.map(u=>({ value: u.id, label: `${u.username}${u.email ? ' ('+u.email+')' : ''}` }));
            setAllUsers(opts);
        }).catch(()=>{});

        axios.get('/events/').then(res=>{
            const payload = res.data;
            const arr = Array.isArray(payload) ? payload : (payload.results || []);
            const opts = arr.map(ev=>({ value: ev.id, label: ev.name }));
            setAllEvents(opts);
        }).catch(()=>{});

        if(groupId){
            axios.get(`/groups/${groupId}/`).then(res=>{
                setName(res.data.name || '');
                setMembers((res.data.members||[]).map(id=>({value:id,label:String(id)})));
                setAdmins((res.data.admins||[]).map(id=>({value:id,label:String(id)})));
                setEvents((res.data.events||[]).map(id=>({value:id,label:String(id)})));
            }).catch(()=>{});
        }
    },[groupId]);

    function handleSubmit(e){
        e.preventDefault();
        const payload = {
            name,
            members: members.map(m=>m.value),
            admins: admins.map(a=>a.value),
            events: events.map(ev=>ev.value)
        };
        if(groupId){
            axios.put(`/groups/${groupId}/`, payload).then(()=>onSaved && onSaved()).catch(err=>{
                console.error('Error updating group:', err.response?.data || err.message);
                alert('Error updating: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
            });
        } else {
            axios.post('/groups/', payload).then(()=>onSaved && onSaved()).catch(err=>{
                console.error('Error creating group:', err.response?.data || err.message);
                alert('Error creating: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <div>
                <label className="group-form-label">
                    📝 Nombre del Grupo *
                </label>
                <input 
                    className="group-form-input"
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    required 
                    placeholder="Ej: Equipo Marketing 2025"
                />
            </div>
            
            <div>
                <label className="group-form-label">
                    👥 Miembros
                </label>
                <Select 
                    isMulti 
                    options={allUsers} 
                    value={members} 
                    onChange={setMembers}
                    placeholder="Selecciona usuarios para el grupo..."
                    styles={{
                        control: (base) => ({
                            ...base,
                            padding: '4px',
                            borderRadius: '10px',
                            border: '2px solid #e2e8f0',
                            fontSize: '14px',
                            '&:hover': { borderColor: '#cbd5e1' }
                        }),
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#dbeafe',
                            borderRadius: '6px'
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            color: '#1e40af',
                            fontWeight: '500'
                        })
                    }}
                />
                <small className="group-form-help">
                    Los miembros podrán ver los eventos del grupo
                </small>
            </div>
            
            <div>
                <label className="group-form-label">
                    👑 Administradores
                </label>
                <Select 
                    isMulti 
                    options={allUsers} 
                    value={admins} 
                    onChange={setAdmins}
                    placeholder="Selecciona administradores..."
                    styles={{
                        control: (base) => ({
                            ...base,
                            padding: '4px',
                            borderRadius: '10px',
                            border: '2px solid #e2e8f0',
                            fontSize: '14px',
                            '&:hover': { borderColor: '#cbd5e1' }
                        }),
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#fef3c7',
                            borderRadius: '6px'
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            color: '#92400e',
                            fontWeight: '500'
                        })
                    }}
                />
                <small className="group-form-help">
                    Los administradores pueden gestionar miembros y eventos
                </small>
            </div>
            
            <div>
                <label className="group-form-label">
                    🎫 Eventos Asociados
                </label>
                <Select 
                    isMulti 
                    options={allEvents} 
                    value={events} 
                    onChange={setEvents}
                    placeholder="Asocia eventos al grupo..."
                    styles={{
                        control: (base) => ({
                            ...base,
                            padding: '4px',
                            borderRadius: '10px',
                            border: '2px solid #e2e8f0',
                            fontSize: '14px',
                            '&:hover': { borderColor: '#cbd5e1' }
                        }),
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#dcfce7',
                            borderRadius: '6px'
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            color: '#166534',
                            fontWeight: '500'
                        })
                    }}
                />
                <small className="group-form-help">
                    Vincula eventos existentes a este grupo
                </small>
            </div>
            
            <button type="submit" className="group-form-submit">
                💾 {groupId ? 'Actualizar Grupo' : 'Crear Grupo'}
            </button>
        </form>
    );
}
