import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://gameangle.onrender.com';

const Signup = () => {
    const { loggedIn, authLoading, setLoggedIn, setUserId, setUsername: setAuthUsername } = useAuth();
    const navigate = useNavigate();

    const [username, setUsernameInput] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && loggedIn) {
            navigate('/');
        }
    }, [authLoading, loggedIn, navigate]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        const nextUsername = username.trim();
        if (!nextUsername || !password) {
            setErrorMessage('Username and password are required.');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(`${API_BASE}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username: nextUsername, password }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            setLoggedIn(true);
            setUserId(data.userId ?? null);
            setAuthUsername(data.username ?? null);
            navigate('/');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Signup failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return null;
    }

    return (
        <Layout>
            <div className="session-creation-container">
                <h1>Sign Up</h1>
                <form onSubmit={handleSignup} className="session-form">
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
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    {errorMessage && (
                        <p role="alert" style={{ color: 'red', marginTop: '10px' }}>
                            {errorMessage}
                        </p>
                    )}

                    <p style={{ marginTop: '12px' }}>
                        Already have an account? <Link to="/login-page">Log In</Link>
                    </p>
                </form>
            </div>
        </Layout>
    );
};

export default Signup;
