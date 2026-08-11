import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';


const startApp = (cordovaWork) => {
    createRoot(document.getElementById('root')).render(
        <div>
            <App cordovaWork={cordovaWork} />
        </div>
    );
}

if (!window.cordova) {
    startApp(false)
} else {
    document.addEventListener('deviceready', () => {
        startApp(true);
    }, false);
}
