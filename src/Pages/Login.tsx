import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './Layout';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://gameangle.onrender.com';

const Login = () => {
    const { setLoggedIn, setUserId, setUsername } = useAuth();
    const navigate = useNavigate();
    const [username, setUsernameInput] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid username or password');
            }

            setUserId(data.userId);
            setUsername(data.username ?? null);
            setLoggedIn(true);
            navigate('/');
        } catch (error) {
            setLoggedIn(false);
            setUserId(null);
            setUsername(null);
            setErrorMessage(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="session-creation-container">
                <h1>Log In</h1>
                <form onSubmit={handleLogin} className="session-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging In...' : 'Log In'}
                    </button>

                    {errorMessage && (
                        <p role="alert" style={{ color: 'red', marginTop: '10px' }}>
                            {errorMessage}
                        </p>
                    )}

                    <p style={{ marginTop: '12px' }}>
                        Need an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </form>
            </div>
        </Layout>
    );
};
export default Login;