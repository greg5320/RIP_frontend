import React from 'react';
import './styles/400errors.css';

const Page403: React.FC = () => {
    return (
        <div className="error-page">
            <h1 className="error-code">403</h1>
            <p className="error-message">Доступ запрещён</p>
        </div>
    );
};

export default Page403;
