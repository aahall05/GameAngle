import { useEffect, useState } from 'react';
import '../Stylesheets/Homepage.css';
import Layout from './Layout';
import Card from '../Components/Card';
import { useNavigate } from 'react-router-dom';
import { SessionCard } from '../Components/Card';
import { useAuth } from '../AuthContext';

type SessionListItem = {
    id: number;
    name: string;
    created_at: string;
};

function UserHomepage() {
    const navigate = useNavigate();
    const { loggedIn, authLoading, username } = useAuth();
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!loggedIn) {
            navigate('/login-page');
            return;
        }

        const loadRecentSessions = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/users/me/recent-sessions', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch recent sessions');
                }

                const data = await response.json();
                setSessions(data.sessions ?? []);
            } catch (error) {
                console.error('Error loading recent sessions:', error);
                setSessions([]);
            } finally {
                setLoadingSessions(false);
            }
        };

        loadRecentSessions();
    }, [authLoading, loggedIn, navigate]);

    return (
        <Layout>
            <>
                <Card className="title-card">
                    <h1>Welcome Back {username ?? 'User'}</h1>
                </Card>

                <div className="homepage-row">
                    <Card className="create-session">
                        <h2> Recent Sessions</h2>
                        {loadingSessions && <p>Loading recent sessions...</p>}

                        {!loadingSessions && sessions.length === 0 && (
                            <p>No sessions created yet.</p>
                        )}

                        {!loadingSessions && sessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                title={`${session.name} - ${new Date(session.created_at).toLocaleDateString()}`}
                                onView={() => navigate(`/game-viewer/${session.id}`)}
                                onShare={() => navigator.clipboard.writeText(`${window.location.origin}/game-viewer/${session.id}`)}
                            />
                        ))}
                    </Card>
                    <Card className="create-session">
                        <div className="homepage-column">
                            <button onClick={() => navigate('/create-session')}>
                                Create Session
                            </button>

                            <button onClick={() => navigate('/join-sessions')}>
                                Join Session
                            </button>
                        </div>
                    </Card>
                </div>

                <button onClick={() => navigate('/user-information')}>
                    User Information
                </button>

            </>
        </Layout>
    );
}

export default UserHomepage;