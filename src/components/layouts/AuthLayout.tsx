import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="auth-layout" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Outlet />
      </div>
    </div>
  );
};