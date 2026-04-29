import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPrompt from './LoginPrompt';

export function ProtectedRoute({ children, showPrompt = false }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    if (showPrompt) {
      return <LoginPrompt />;
    }
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  if (!isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ notice: 'That area is for administrators only.' }}
      />
    );
  }
  return children;
}
