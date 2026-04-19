import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import EntityPage from '../pages/EntityPage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

function AppRouter({ session, onLogin, onLogout }) {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={session ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={onLogin} />}
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute session={session}>
                            <Layout session={session} onLogout={onLogout} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage session={session} />} />
                    <Route path="user/:id" element={<EntityPage section="user" title="用户管理" />} />
                    <Route path="game/:id" element={<EntityPage section="game" title="游戏管理" />} />
                    <Route path="details/:id" element={<EntityPage section="details" title="详情页" />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;