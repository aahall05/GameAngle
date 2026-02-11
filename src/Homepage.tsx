import { useState } from 'react';
import './Homepage.css';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom'; 

function Homepage() {
    const navigate = useNavigate();
    return (
        <Layout>
        <>
                <button onClick={() => navigate('/create-session')}>
                    Create Session
                </button>

        </>
        </Layout>
    );
}    

export default Homepage;