import { useState } from 'react';
import Layout from './Layout';
//import '../index.css'
import '../Stylesheets/SessionCreation.css';
import { useNavigate } from 'react-router-dom';

function SessionCreation() {

    const navigate = useNavigate();
    const [eventName, setEventName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');

    const generateSessionId = () => {
        // creates a random string like "a3f8b2c1"
        return Math.random().toString(36).substring(2, 10);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const sessionId = generateSessionId();
        const createdAt = new Date().toISOString(); 

        // container to hold session data
        // for now just logs to console, but get the information from this object to send to the backend
        const sessionData = {
            sessionId,
            eventName,
            organizationName,
            date,
            time,
            description,
            createdAt
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
                        <label htmlFor="eventName">Event Name *</label>
                        <input
                            type="text"
                            id="eventName"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="organizationName">Organization Name *</label>
                        <input
                            type="text"
                            id="organizationName"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date (MM/DD/YYYY) *</label>
                        <input
                            type="text"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            placeholder="MM/DD/YYYY"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time">Time (HH:MM AM/PM) *</label>
                        <input
                            type="text"
                            id="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            placeholder="HH:MM AM/PM"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (optional)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Create Session
                    </button>
                </form>
            </div>
        </Layout>
    );
}

export default SessionCreation;