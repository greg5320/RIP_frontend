import React from 'react';
import './styles/400errors.css';

const Page404: React.FC = () => {
    return (
        <div className="error-page">
            <h1 className="error-code">404</h1>
            <p className="error-message">Страница не найдена</p>
        </div>
    );
};

export default Page404;