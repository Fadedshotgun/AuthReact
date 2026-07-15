import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../AuthContext";
import { Link } from 'react-router-dom';

import "./Credentials.css"

const API = import.meta.env.VITE_API_URL

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const navigate = useNavigate();

    const { refetch } = useAuthContext();

    const validateCredentials = () => {
        setUsernameError('');
        setPasswordError('');
        var failed = false;

        if (!username.trim()) { setUsernameError('Username is requrired'); failed = true; }
        if (username.length < 3) { setUsernameError('Username must be at least 3 characters'); failed = true; }
        if (!/^[a-zA-Z0-9_.]+$/.test(username)) { setUsernameError('Username can only contain letters, numbers underscores, and periods'); failed = true; }
        if (/[_.]{2,}/.test(username)) { setUsernameError('Username cannot contain consecutive dots or underscores'); failed = true; }

        if (!password) { setPasswordError('Password is required'); failed = true };

        return failed;
    }

    const register = async () => {
        if (submitting) return;

        const invalid = validateCredentials();
        if (invalid) return;

        setSubmitting(true);

        const signupFormData = new FormData();
        signupFormData.append('username', username);
        signupFormData.append('password', password);

        const response = await fetch(`${API}/api/public/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            await new Promise(r => setTimeout(r, 200));
            const response2 = await fetch(`${API}/api/public/login`, { method: 'POST', body: signupFormData, credentials: 'include' });
            if (response2.ok) {
                await refetch();
                await new Promise(r => setTimeout(r, 200));
                navigate('/messages');
            } else {
                setError('Registration failed, please try again (also send this to a developer)');
            }
        } else {
            if (response.status == 429) {
                setError('You have created too many accounts recently, try again in an hour');
            } else {
                setError('Invalid username or password');
            }

        }
        setSubmitting(false);
    }

    return (
        <div className="fullscreen-container">
            <div className="credentials-container">
                <h1 className="credentials-title">- Sign up -</h1>
                <form className="credentials-form">
                    <div className="input-group">
                        <label>Username</label>
                        <input id="username" value={username} onChange={e => setUsername(e.target.value)}></input>
                        {usernameError && <label className="credentials-error">{usernameError}</label>}
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}></input>
                        {passwordError && <label className="credentials-error">{passwordError}</label>}
                    </div>

                    <div className="input-group">
                        {error && <label className="credentials-error">{error}</label>}
                        <button type="button" onClick={register} className="credentials-button">{submitting ? 'Signing up...' : 'Sign up'}</button>
                    </div>

                    <div className="redirector">
                        <p>Already have an account? </p>
                        <Link className="redirect-button" to="/login">Click here to login!</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}