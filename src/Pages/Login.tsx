import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './Layout';

const Login = () => {
    const { setLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // TODO : implement login verification and pass in userID on success
        // make a POST request to your backend endpoint (e.g. http://localhost:3000/api/login)
        // send username and password in the request body as JSON
        // if response.ok, call setUserId(data.userId) and setLoggedIn(true) then navigate('/')
        // if response fails, display an error message to the user
        setLoggedIn(true);
        navigate('/');
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
                            onChange={(e) => setUsername(e.target.value)}
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

                    <button type="submit" className="submit-button">
                        Log In
                    </button>
                </form>
            </div>
        </Layout>
    );
};
export default Login;