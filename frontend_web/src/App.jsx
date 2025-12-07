import React, { useState, useEffect } from 'react';
import EventList from './components/EventList';
import RegistrationList from './components/RegistrationList';
import GroupList from './components/GroupList';
import JoinGroup from './components/JoinGroup';
import UserProfile from './components/UserProfile';
import ProfileSettings from './components/ProfileSettings';
import Login from './components/Login';
import Register from './components/Register';
import { fetchCurrentUser } from './auth';
import ErrorBoundary from './ErrorBoundary';

function App(){
    const [view,setView] = useState('events');
    const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('access_token'));
    const [currentUser, setCurrentUser] = useState(null);
    const [joinToken, setJoinToken] = useState(null);
    const [showRegister, setShowRegister] = useState(false);
    const [emailNotVerifiedAlert, setEmailNotVerifiedAlert] = useState(false);

    // Escuchar evento de email no verificado
    useEffect(() => {
        const handleEmailNotVerified = (event) => {
            setEmailNotVerifiedAlert(true);
            setView('profile'); // Redirigir al perfil para verificación
        };
        
        window.addEventListener('email-not-verified', handleEmailNotVerified);
        return () => window.removeEventListener('email-not-verified', handleEmailNotVerified);
    }, []);

    // Verificar automáticamente al cargar usuario si no está verificado
    useEffect(() => {
        if (currentUser && !currentUser.email_verified && authenticated) {
            setView('profile'); // Abrir automáticamente el perfil
            setEmailNotVerifiedAlert(true);
        }
    }, [currentUser, authenticated]);

    // Handle URL hash routing for invitations and OAuth
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            
            // Handle OAuth success callback
            const oauthMatch = hash.match(/#\/oauth-success\?access=(.+?)&refresh=(.+)/);
            if (oauthMatch) {
                const accessToken = oauthMatch[1];
                const refreshToken = oauthMatch[2];
                
                // Save tokens
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                
                // Update auth state
                setAuthenticated(true);
                
                // Redirect to events page
                window.location.hash = '#/';
                setView('events');
                
                // Fetch user data
                fetchCurrentUser()
                    .then(user => {
                        setCurrentUser(user);
                        console.log('OAuth login successful:', user);
                    })
                    .catch(err => {
                        console.error('Error fetching user after OAuth:', err);
                    });
                
                return;
            }
            
            // Handle OAuth error
            const errorMatch = hash.match(/#\/login\?error=(.+)/);
            if (errorMatch) {
                alert('Error al iniciar sesión con OAuth. Por favor intenta de nuevo.');
                window.location.hash = '#/';
                return;
            }
            
            // Handle invitation links
            const joinMatch = hash.match(/#\/join\/(.+)/);
            if (joinMatch) {
                setJoinToken(joinMatch[1]);
                setView('join');
            }
        };
        
        handleHashChange(); // Check on mount
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(()=>{
        const onStorage = () => setAuthenticated(!!localStorage.getItem('access_token'));
        window.addEventListener('storage', onStorage);
        return ()=> window.removeEventListener('storage', onStorage);
    },[]);

    useEffect(()=>{
        let mounted = true;
        async function load(){
            if (!authenticated){
                setCurrentUser(null);
                return;
            }
            const u = await fetchCurrentUser();
            if (mounted) setCurrentUser(u);
        }
        load();
        return ()=>{ mounted = false };
    },[authenticated]);
    return (
        <div style={{display:'flex',flexDirection:'column',minHeight:'100vh'}}>
            <nav>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:'1200px',margin:'0 auto'}}>
                    <div style={{display:'flex',alignItems:'center',gap:0}}>
                        <div className="brand" style={{marginRight:32}}>EventoApp</div>
                        <button className="btn secondary" onClick={()=>setView('events')} style={{marginRight:0}}>📅 Eventos</button>
                        {authenticated && (
                            <>
                                <button className="btn secondary" onClick={()=>setView('registrations')} style={{marginRight:0}}>✓ Mis Inscripciones</button>
                                <button className="btn secondary" onClick={()=>setView('groups')} style={{marginRight:0}}>👥 Mis Grupos</button>
                            </>
                        )}
                    </div>
                    <div className="nav-right" style={{display:'flex',alignItems:'center',gap:16}}>
                        {currentUser ? (
                            <div style={{display:'flex',alignItems:'center',gap:16}}>
                                <div style={{cursor:'pointer',display:'flex',alignItems:'center',gap:12}} onClick={() => setView('profile')} title="Ver perfil">
                                    {currentUser.avatar_url ? (
                                        <img 
                                            src={currentUser.avatar_url} 
                                            alt={currentUser.username}
                                            style={{
                                                width:40,
                                                height:40,
                                                borderRadius:'50%',
                                                objectFit:'cover',
                                                border:'2px solid var(--primary)',
                                                cursor:'pointer'
                                            }}
                                        />
                                    ) : (
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=random&size=40`}
                                            alt={currentUser.username}
                                            style={{
                                                width:40,
                                                height:40,
                                                borderRadius:'50%',
                                                border:'2px solid var(--muted)',
                                                cursor:'pointer'
                                            }}
                                        />
                                    )}
                                    <div style={{display:'flex',flexDirection:'column'}}>
                                        <div style={{fontWeight:600,fontSize:'14px'}}>{currentUser.username}</div>
                                        <div className="muted" style={{fontSize:'12px'}}>{currentUser.email}</div>
                                    </div>
                                </div>
                                <button className="btn" onClick={()=>{ localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); setAuthenticated(false); }}>Logout</button>
                            </div>
                        ) : (
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                                {!showRegister && (
                                    <button className="btn" onClick={() => setShowRegister(true)}>
                                        Crear cuenta
                                    </button>
                                )}
                                {showRegister && (
                                    <button className="btn secondary" onClick={() => setShowRegister(false)}>
                                        Volver a login
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            <div style={{flex:1}}>
            {!authenticated && view !== 'join' && !showRegister && (
                <Login 
                    onLogin={()=>{
                        setAuthenticated(true);
                        setShowRegister(false);
                        setView('events');
                    }} 
                    onShowRegister={() => setShowRegister(true)}
                />
            )}
            {!authenticated && showRegister && (
                <ErrorBoundary>
                    <Register 
                        onRegisterSuccess={() => {
                            setShowRegister(false);
                        }}
                        onBackToLogin={() => setShowRegister(false)}
                    />
                </ErrorBoundary>
            )}
            {view === 'join' && (
                <ErrorBoundary>
                    <JoinGroup 
                        token={joinToken} 
                        onSuccess={(groupId) => {
                            window.location.hash = '';
                            setView('groups');
                        }}
                        onCancel={() => {
                            window.location.hash = '';
                            setView('events');
                        }}
                    />
                </ErrorBoundary>
            )}
            {view === 'events' && (
                <ErrorBoundary><EventList /></ErrorBoundary>
            )}
            {view === 'registrations' && authenticated ? (
                <ErrorBoundary><RegistrationList /></ErrorBoundary>
            ) : view === 'registrations' ? (
                <div className="container">
                    <div className="card" style={{textAlign:'center'}}>
                        <h2>Acceso restringido</h2>
                        <p>Debes iniciar sesión para ver tus inscripciones</p>
                        <button className="btn" onClick={() => setView('events')}>Volver a Eventos</button>
                    </div>
                </div>
            ) : null}
            {view === 'groups' && authenticated ? (
                <ErrorBoundary><GroupList /></ErrorBoundary>
            ) : view === 'groups' ? (
                <div className="container">
                    <div className="card" style={{textAlign:'center'}}>
                        <h2>Acceso restringido</h2>
                        <p>Debes iniciar sesión para ver tus grupos</p>
                        <button className="btn" onClick={() => setView('events')}>Volver a Eventos</button>
                    </div>
                </div>
            ) : null}
            {view === 'profile' && authenticated && currentUser ? (
                <ErrorBoundary>
                    <UserProfile 
                        userId={currentUser.id} 
                        onBack={() => setView('events')}
                        showVerificationAlert={emailNotVerifiedAlert}
                        onClearAlert={() => setEmailNotVerifiedAlert(false)}
                    />
                </ErrorBoundary>
            ) : view === 'profile' ? (
                <div className="container">
                    <div className="card" style={{textAlign:'center'}}>
                        <h2>Acceso restringido</h2>
                        <p>Debes iniciar sesión para ver tu perfil</p>
                        <button className="btn" onClick={() => setView('events')}>Volver a Eventos</button>
                    </div>
                </div>
            ) : null}
            </div>
        </div>
    );
}

export default App;
