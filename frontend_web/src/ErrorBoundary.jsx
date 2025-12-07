import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props){
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error){
        return { hasError: true, error };
    }

    componentDidCatch(error, info){
        // You could log to a remote service here
        console.error('ErrorBoundary caught', error, info);
    }

    render(){
        if (this.state.hasError){
            return (
                <div style={{padding:16}} className="card">
                    <h3>Se produjo un error en la vista</h3>
                    <div style={{whiteSpace:'pre-wrap',color:'var(--danger)'}}>{String(this.state.error)}</div>
                    <div style={{marginTop:10}}>
                        <button className="btn" onClick={()=>this.setState({hasError:false,error:null})}>Reintentar</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
