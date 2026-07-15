import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../AuthContext";
import { Link } from 'react-router-dom';

import "./Credentials.css"

const API = import.meta.env.VITE_API_URL

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { refetch } = useAuthContext();

    const login = async () => {
        if (submitting) return;
        setSubmitting(true);

        const loginFormData = new FormData();
        loginFormData.append('username',username);
        loginFormData.append('password',password);

        const response = await fetch(`${API}/api/public/login`, {method: 'POST', body: loginFormData, credentials: 'include'});
        if (response.ok) {
            await refetch();
            await new Promise(resolve => setTimeout(resolve, 200));
           navigate('/messages');
        } else {
            if (response.status == 429) {
                setError('You have tried too many times, please try again in 15 minutes');
            } else {
                setError('Invalid username or password');
            }
        }
        setSubmitting(false);
    }

    return (
        <div className="fullscreen-container">
            <div className="credentials-container">
                <h1 className="credentials-title">- Login -</h1>
                <form className="credentials-form">
                    <div className="input-group">
                        <label>Username</label>
                        <input id="username" value={username} onChange={e => setUsername(e.target.value)}></input>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}></input>
                    </div>

                    <div className = "input-group">
                        {error && <label className="credentials-error">{error}</label>}
                        <button type="button" onClick={login} className="credentials-button">{submitting ? 'Logging in...' : 'Login'}</button>
                    </div>

                    <div className="redirector">
                        <p>Don't have an account? </p>
                        <Link className="redirect-button" to="/register">Click here to sign up!</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}