import React from 'react';
import '../Stylesheets/Card.css';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`card ${className || ''}`}>
        {children}
    </div>
);

export default Card;