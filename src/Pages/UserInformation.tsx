import { useState } from 'react';
import Layout from './Layout';
//import '../index.css'
import { useNavigate } from 'react-router-dom';

function UserInformation() {

    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [organizaitonName, setOrganizationName] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber,setPhoneNumber] = useState('');

    const generateSessionId = () => {
        // creates a random string like "a3f8b2c1"
        return Math.random().toString(36).substring(2, 10);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const sessionId = generateSessionId();

        // container to hold user data
        // for now just logs to console, but get the information from this object to send to the backend
        const sessionData = {
            sessionId,
            firstName,
            lastName,
            organizaitonName,
            password,
            phoneNumber
        };
        console.log('Session created:', sessionData);

        // redirect to upload page with the session ID
        // navigate(`/upload/${sessionId}`);
    };

    return (
        <Layout>
            <div className="session-creation-container">
                <h1>Create Session</h1>
                <form onSubmit={handleSubmit} className="session-form">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="text"
                            id="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your-email@domian.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="organizaitonName">Organizaiton Name *</label>
                        <input
                            type="text"
                            id="organizaitonName"
                            value={organizaitonName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            required
                        />
                    </div>


                    <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Save Changes
                    </button>
                </form>
            </div>
        </Layout>
    );
}

export default UserInformation;