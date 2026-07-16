import React, { useState, useEffect } from 'react';
import "../../assets/css/login.css";
import "../../assets/css/signup.css";

function NoqLogin({ isOpen, onClose, initialView = "login" }) {
  const [isSignupView, setIsSignupView] = useState(false);
  const [role, setRole] = useState('user');

  useEffect(() => {
    if (isOpen) {
      setIsSignupView(initialView === "signup");
    }
  }, [isOpen, initialView]);
  
  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login captured within React context!");
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    console.log("Signup captured with Role:", role);
  };

  const handleCloseModal = () => {
    setIsSignupView(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
  
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
        onClick={handleCloseModal}
      />

      <div className="relative bg-white grid login-container rounded-xl shadow-2xl p-8 z-10 max-w-sm w-full mx-auto border border-gray-100 max-h-[95vh] overflow-y-auto">
        
        <button 
          type="button"
          onClick={handleCloseModal}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 font-bold text-xl cursor-pointer"
        >
          &times;
        </button>

        {isSignupView ? (
          <div className="container text-center">
            <main className="form-area mt-4">
              <h2 className="text-md text-gray-700 font-bold">create your account.</h2>

              <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3 text-left mt-2">
                <div className="input-group">
                  <label htmlFor="role" className="block text-xs font-bold uppercase text-gray-400 mb-1">Register As:</label>
                  <select 
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border border-gray-200 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-700 font-medium cursor-pointer"
                  >
                    <option value="user">User (Normal Customer)</option>
                    <option value="organization">Organization (Business/Bank/Clinic)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="username" className="block text-xs font-bold uppercase text-gray-400 mb-1">Username:</label>
                  <input className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" id="username" name="username" placeholder="Enter your username" required />
                </div>

                <div className="input-group">
                  <label htmlFor="email" className="block text-xs font-bold uppercase text-gray-400 mb-1">Email Address:</label>
                  <input className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" id="email" name="email" placeholder="Enter your email" required />
                </div>

                <div className="input-group">
                  <label htmlFor="password" className="block text-xs font-bold uppercase text-gray-400 mb-1">Password:</label>
                  <input className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="password" name="password" placeholder="Enter your password" required />
                </div>

                <div className="input-group">
                  <label htmlFor="confirm-password" className="block text-xs font-bold uppercase text-gray-400 mb-1">Confirm Password:</label>
                  <input className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="confirm-password" name="confirm-password" placeholder="Confirm your password" required />
                </div>
                
                <button type="submit" className="btn-primary bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer mt-3">
                  Sign Up as {role === 'user' ? 'User' : 'Organization'}
                </button>
                 <button 
                type="button"
                className="switch-page text-blue-500 hover:text-blue-700 text-sm font-semibold my-2 cursor-pointer bg-transparent border-none"
                onClick={() => setIsSignupView(false)} 
              >
                already have an account Login?
              </button>
              </form>
            </main>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="py-2 text-2xl font-black text-gray-900">NOQ Login Page (logo)</h1>
            <p className="text-sm text-gray-500">skip the wait, not the queue</p>
            <p className="text-sm text-gray-500 mb-4">sign in to your account.</p>
            <p className="text-xs text-gray-400">new here?</p> 
            <p className="mb-6">
              <button
                type="button"
                className="text-blue-500 hover:text-blue-700 text-sm font-semibold cursor-pointer bg-transparent border-none" 
                onClick={() => setIsSignupView(true)} 
              >
                create an account?
              </button>
            </p> 

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label htmlFor="login-username" className="block text-xs font-bold uppercase text-gray-400 mb-1">Username:</label>
                <input 
                  className="border border-gray-200 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="text" 
                  id="login-username" 
                  name="username" 
                  required 
                  placeholder="Enter your username" 
                />
              </div>
              
              <div className="mb-2">
                <label htmlFor="login-password" className="block text-xs font-bold uppercase text-gray-400 mb-1">Password:</label>
                <input 
                  className="border border-gray-200 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="password" 
                  id="login-password" 
                  name="password" 
                  required 
                  placeholder="Enter your password" 
                />
              </div>
              
              <button className="login-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer" type="submit">
                Login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default NoqLogin;