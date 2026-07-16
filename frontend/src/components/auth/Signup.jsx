import React, { useState } from 'react';
import "../assets/css/signup.css";

function NoqSignup({ onSwitchToLogin }) {
  const [role, setRole] = useState('user');

  const handleSignupSubmit = (e) => {
    e.preventDefault(); 
    console.log("Signup data submitted with Role:", role);
  };

  return (
    <div className="container">
      <main className="form-area">
        <h2>create your account.</h2>
        
        <p 
          className="switch-page cursor-pointer text-blue-500 hover:text-blue-700 inline-block"
          onClick={onSwitchToLogin}
        >
          already have an account Login?
        </p>

        <form onSubmit={handleSignupSubmit}>
          <div className="input-group">
            <label htmlFor="role">Register As:</label>
            <select 
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                cursor: 'pointer',
                marginTop: '5px'
              }}
            >
              <option value="user">User (Normal Customer)</option>
              <option value="organization">Organization (Business/Bank/Clinic)</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="Enter your username" 
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Enter your email" 
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Enter your password" 
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password:</label>
            <input 
              type="password" 
              id="confirm-password" 
              name="confirm-password" 
              placeholder="Confirm your password" 
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary cursor-pointer">
            Sign Up as {role === 'user' ? 'User' : 'Organization'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default NoqSignup;