import { useState } from 'react';
import '../Stylesheets/Homepage.css';
import Layout from './Layout';
import Card from '../Components/Card';
import { useNavigate } from 'react-router-dom'; 

function Homepage() {
    const navigate = useNavigate();
    return (
        <Layout>
            <>
                <Card className="title-card">
                    <h1>GameAngle</h1>
                </Card>

                <div className="homepage-row">
                    <Card className="create-session">
                    <button onClick={() => navigate('/create-session')}>
                        Create Session
                        </button>
                    </Card>
                    <Card className="create-session">
                        <button onClick={() => navigate('/join-session')}>
                            Join Session
                        </button>
                    </Card>
                </div>

        </>
        </Layout>
    );
}    

export default Homepage;