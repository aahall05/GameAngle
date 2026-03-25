import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Card from '../Components/Card';
import { useAuth } from '../AuthContext';
import '../Stylesheets/JoinSessions.css';

type SessionListItem = {
    id: number;
    name: string;
    created_at: string;
};

function JoinSessions() {
    const navigate = useNavigate();
    const { loggedIn, authLoading } = useAuth();
    const [search, setSearch] = useState('');
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const searchParam = useMemo(() => search.trim(), [search]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!loggedIn) {
            navigate('/login-page');
        }
    }, [authLoading, loggedIn, navigate]);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            setErrorMessage('');

            try {
                const response = await fetch(`http://localhost:3000/api/sessions?search=${encodeURIComponent(searchParam)}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load sessions');
                }

                setSessions(data.sessions || []);
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Failed to load sessions');
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [searchParam]);

    const handleJoin = (collageId: number) => {
        navigate(`/game-viewer/${collageId}`);
    };

    return (
        <Layout>
            <div className="join-sessions-container">
                <Card className="join-sessions-header-card">
                    <h1>Join Session</h1>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by session name"
                        className="join-sessions-search"
                    />
                </Card>

                {loading && <p>Loading sessions...</p>}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                {!loading && !errorMessage && sessions.length === 0 && (
                    <p>No sessions found.</p>
                )}

                {!loading && !errorMessage && sessions.length > 0 && (
                    <div className="join-sessions-list">
                        {sessions.map((session) => (
                            <Card className="join-sessions-item" key={session.id}>
                                <div>
                                    <h3>{session.name}</h3>
                                    <p>
                                        Created: {new Date(session.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => handleJoin(session.id)}>Open Viewer</button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default JoinSessions;
