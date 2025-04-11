import React from 'react';
import './Preloader.css';

const Preloader = () => {
    return (
        <div className="preloader-container">
            <div className="magnifying-glass">
                <div className="fill-effect"></div>
            </div>
            <h3 className="loading-text">Loading...</h3>
        </div>
    );
};

export default Preloader;
