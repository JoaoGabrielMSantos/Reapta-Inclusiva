import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('auth') === 'true';

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
