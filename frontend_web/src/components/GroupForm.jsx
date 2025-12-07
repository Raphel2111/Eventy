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
        <form onSubmit={handleSubmit}>
            <div>
                <label>Nombre</label>
                <input value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div>
                <label>Miembros</label>
                <Select isMulti options={allUsers} value={members} onChange={setMembers} />
            </div>
            <div>
                <label>Admins del grupo</label>
                <Select isMulti options={allUsers} value={admins} onChange={setAdmins} />
            </div>
            <div>
                <label>Eventos asociados</label>
                <Select isMulti options={allEvents} value={events} onChange={setEvents} />
            </div>
            <button type="submit">Guardar</button>
        </form>
    );
}
