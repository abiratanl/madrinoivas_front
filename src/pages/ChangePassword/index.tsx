// src/pages/ChangePassword/index.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for form fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Retrieve the temporary token passed from the Login page
  // The syntax "location.state as { tempToken: string }" is a TS assertion
  const tempToken = (location.state as { tempToken: string })?.tempToken;

  useEffect(() => {
    // Security check: If there is no token, kick the user back to login
    if (!tempToken) {
      navigate('/auth/login', { replace: true });
    }
  }, [tempToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Client-side validation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // 2. API Call
      // We use axios directly here because we need to send a specific header (tempToken)
      // that is NOT currently in the global AuthContext default headers.
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          currentPassword, // Backend requirement
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${tempToken}` // Use the temp token to authorize this action
          }
        }
      );

      // 3. Handle Success
      setSuccess(true);
      setTimeout(() => {
        // Redirect to login after 2 seconds so the user can sign in with new credentials
        navigate('/auth/login');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to change password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'green' }}>
        <h2>Success!</h2>
        <p>Your password has been updated.</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Change Password</h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
        For security reasons, you must change your password on the first access.
      </p>

      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', color: '#c62828', 
          padding: '10px', borderRadius: '4px', marginBottom: '15px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Current Password Field */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
            placeholder="Enter the password you just used"
          />
        </div>

        {/* New Password Field */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
            placeholder="Enter new password"
          />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
            placeholder="Repeat new password"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}