import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('auth') === 'true';

  if (!isAuth) {
    // redirect to login and preserve the location the user was trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
