import '../Stylesheets/Homepage.css';
import Layout from './Layout';
import Card from '../Components/Card';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../AuthContext';

function Homepage() {
    const navigate = useNavigate();
    const { loggedIn, authLoading } = useAuth();

    const handleCreateSessionClick = () => {
        if (!loggedIn) {
            navigate('/login-page');
            return;
        }

        navigate('/create-session');
    };

    const handleJoinSessionClick = () => {
        if (!loggedIn) {
            navigate('/login-page');
            return;
        }

        navigate('/join-sessions');
    };

    return (
        <Layout>
            <>
                <Card className="title-card">
                    <h1>GameAngle</h1>
                </Card>

                <div className="homepage-row">
                    <Card className="create-session">
                    <button onClick={handleCreateSessionClick} disabled={authLoading}>
                        Create Session
                        </button>
                    </Card>
                    <Card className="create-session">
                        <button onClick={handleJoinSessionClick} disabled={authLoading}>
                            Join Session
                        </button>
                    </Card>
                </div>

        </>
        </Layout>
    );
}    

export default Homepage;