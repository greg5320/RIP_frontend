// import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
  
);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(() => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}