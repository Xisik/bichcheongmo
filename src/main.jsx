import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import '../assets/css/00_tokens.css';
import '../assets/css/00_tokens.dark.css';
import '../assets/css/01_base.css';
import '../assets/css/02_layout.css';
import '../assets/css/03_components.css';
import '../assets/css/04_modal.css';
import '../assets/css/05_toast.css';
import '../assets/css/06_animations.css';
import '../assets/css/07_thumbnail_slide.css';
import './styles/react.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
