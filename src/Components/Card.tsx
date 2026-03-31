import React from 'react';
import '../Stylesheets/Card.css';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`card ${className || ''}`}>
        {children}
    </div>
);
export const SessionCard: React.FC<{
    title: string;
    onView: () => void;
    onShare: () => void;
}> = ({ title, onView, onShare }) => (
    <div className="session-card">
        <span className="session-card-title">{title}</span>
        <div className="session-card-buttons">
            <button onClick={onView}>Watch</button>
            <button onClick={onShare}>Share</button>
        </div>
    </div>
);
export default Card;