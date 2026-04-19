import { useState } from 'react';
import AppRouter from './router';
import { clearStoredSession, getStoredSession, persistSession } from './services/api';

function App() {
    const [session, setSession] = useState(() => getStoredSession());

    const handleLogin = (nextSession) => {
        persistSession(nextSession);
        setSession(nextSession);
    };

    const handleLogout = () => {
        clearStoredSession();
        setSession(null);
    };

    return <AppRouter session={session} onLogin={handleLogin} onLogout={handleLogout} />;
}

export default App;