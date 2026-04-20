import { useEffect, useState } from 'react';
import '../Stylesheets/Homepage.css';
import Layout from './Layout';
import Card from '../Components/Card';
import { useNavigate } from 'react-router-dom'; 

type PublicSession = {
    id: number;
    name: string;
    created_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function Homepage() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<PublicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/sessions`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load collages');
                }

                setSessions(data.sessions ?? []);
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Failed to load collages');
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    return (
        <Layout>
            <>
                <Card className="title-card">
                    <h1>GameAngle</h1>
                </Card>

                <Card className="create-session">
                    <h2>Available Collages</h2>

                    {loading && <p>Loading collages...</p>}
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                    {!loading && !errorMessage && sessions.length === 0 && (
                        <p>No collages found.</p>
                    )}

                    {!loading && !errorMessage && sessions.length > 0 && (
                        <div className="public-collage-list">
                            {sessions.map((session) => (
                                <div key={session.id} className="public-collage-item">
                                    <div>
                                        <p className="public-collage-title">{session.name}</p>
                                        <small>Created: {new Date(session.created_at).toLocaleDateString()}</small>
                                    </div>
                                    <button onClick={() => navigate(`/game-viewer/${session.id}`)}>
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

        </>
        </Layout>
    );
}    

export default Homepage;