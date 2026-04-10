import { useState } from 'react';
import Layout from './Layout';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function UserInformation() {
    const { username: currentUsername, setUsername } = useAuth();
    const [username, setLocalUsername] = useState(currentUsername || '');
    const [password, setPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage('');
        setErrorMessage('');

        const nextUsername = username.trim();
        const currentUsernameTrimmed = (currentUsername || '').trim();
        const isUsernameChanged = nextUsername.length > 0 && nextUsername !== currentUsernameTrimmed;
        const isPasswordProvided = password.length > 0;

        if (!isUsernameChanged && !isPasswordProvided) {
            setErrorMessage('Provide a new username or password to update.');
            return;
        }

        const payload: { username?: string; password?: string } = {};
        if (isUsernameChanged) {
            payload.username = nextUsername;
        }
        if (isPasswordProvided) {
            payload.password = password;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(`${API_BASE}/api/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setErrorMessage(data.error || 'Failed to update user information.');
                return;
            }

            if (isUsernameChanged) {
                setUsername(nextUsername);
            }

            if (isUsernameChanged && isPasswordProvided) {
                setStatusMessage('Username and password updated successfully.');
            } else if (isUsernameChanged) {
                setStatusMessage('Username updated successfully.');
            } else {
                setStatusMessage('Password updated successfully.');
            }

            setPassword('');
        } catch (error) {
            console.error('Error updating user information:', error);
            setErrorMessage('Could not update user information. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="session-creation-container">
                <h1>User Information</h1>
                <form onSubmit={handleSubmit} className="session-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setLocalUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {statusMessage && <p style={{ color: 'green' }}>{statusMessage}</p>}
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}

export default UserInformation;