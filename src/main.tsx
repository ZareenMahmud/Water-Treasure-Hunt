import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerSW} from 'virtual:pwa-register';

// Register Service Worker for offline play and asset caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Deep Sea Treasure update available');
  },
  onOfflineReady() {
    console.log('Deep Sea Treasure is ready to play offline!');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

