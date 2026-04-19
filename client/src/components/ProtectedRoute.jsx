import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, session }) {
    const location = useLocation();

    if (!session?.token) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}

export default ProtectedRoute;