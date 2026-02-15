import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initDatabase, initializeTables } from './services/database';
import { ThirdwebAppProvider } from './components/ThirdwebProvider';

// Initialize database connection
initDatabase();

// Initialize tables (if database is available)
initializeTables().catch((error) => {
  console.error('Failed to initialize database tables:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThirdwebAppProvider>
      <App />
    </ThirdwebAppProvider>
  </StrictMode>
);
