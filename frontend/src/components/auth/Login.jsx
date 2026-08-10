import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService'; 
import "../../assets/css/login.css";
import "../../assets/css/signup.css";

function NoqLogin({ isOpen, onClose, initialView = "login", onLoginSuccess }) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('login');
  const [role, setRole] = useState('user');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    institution_name: '',
    description: '',
    website: ''
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Reset Password states
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView === "signup" ? "signup" : "login");
      resetForm();
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setOtp(['', '', '', '', '', '']);
    setResetEmail('');
    setResetOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmNewPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleOtpChange = (element, index, type = 'register') => {
    const value = element.value;
    if (/[^0-9]/.test(value) && value !== '') return;

    if (type === 'register') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-digit-${index + 1}`)?.focus();
      }
    } else {
      const newResetOtp = [...resetOtp];
      newResetOtp[index] = value;
      setResetOtp(newResetOtp);
      if (value && index < 5) {
        document.getElementById(`reset-otp-digit-${index + 1}`)?.focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index, type = 'register') => {
    if (e.key === 'Backspace') {
      if (type === 'register' && !otp[index] && index > 0) {
        document.getElementById(`otp-digit-${index - 1}`)?.focus();
      } else if (type === 'reset' && !resetOtp[index] && index > 0) {
        document.getElementById(`reset-otp-digit-${index - 1}`)?.focus();
      }
    }
  };

  const switchView = (view) => {
    setErrorMessage('');
    setSuccessMessage('');
    setCurrentView(view);
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  // --- API HANDLERS ---

  // 1. LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const data = await authService.login(formData.email, formData.password);
      
      // Safely check and extract role from response
      const userRole = (data?.user?.role || data?.role || localStorage.getItem('userRole') || 'user').toLowerCase();
      const username = data?.user?.name || '';
      localStorage.setItem('userRole', userRole);
      if (username) {
        localStorage.setItem('username', username);
      }

      setSuccessMessage(data?.message || 'Login successful!');

      setTimeout(() => {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(userRole);
        } else {
          // Route appropriately based on user type to prevent profile mismatch errors
          switch (userRole) {
            case 'admin':
              navigate('/admin');
              break;
            case 'institution':
            case 'org':
              navigate('/org');
              break;
            case 'user':
            default:
              navigate('/user');
              break;
          }
        }
        handleCloseModal();
      }, 800);

    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.response?.data?.detail || error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SIGNUP
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.register({
        username: formData.username.trim(),
        role: role.toLowerCase(),
        email: formData.email,
        password: formData.password
      });

      setSuccessMessage(data?.message || 'Registration initiated! OTP sent to your email.');
      setTimeout(() => switchView('otp'), 1200);

    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFY OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = await authService.verifyRegister({
        email: formData.email,
        otp: fullOtp,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        institution_name: formData.institution_name || undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
      });

      const verifiedRole = (data?.role || role || 'user').toLowerCase();
      const verifiedName = data?.name || formData.username;
      localStorage.setItem('userRole', verifiedRole);
      if (verifiedName) {
        localStorage.setItem('username', verifiedName);
      }

      setSuccessMessage('Account verified successfully! Redirecting...');

      setTimeout(() => {
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(verifiedRole);
        } else {
          switch (verifiedRole) {
            case 'admin':
              navigate('/admin');
              break;
            case 'institution':
            case 'org':
              navigate('/org');
              break;
            case 'user':
            default:
              navigate('/user');
              break;
          }
        }
        handleCloseModal();
      }, 1200);

    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. RESEND OTP
  const handleResendOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('Sending new code...');

    try {
      const data = await authService.resendOtp(formData.email);
      setSuccessMessage(data?.message || 'A new verification code has been sent.');
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.message);
      setSuccessMessage('');
    }
  };

  // 5. REQUEST RESET PASSWORD
  const handleRequestResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await authService.requestResetPassword(resetEmail);
      setSuccessMessage('Reset OTP sent to your email.');
      setTimeout(() => switchView('verify-reset-otp'), 1000);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  // 6. VERIFY RESET OTP
  const handleVerifyResetOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = resetOtp.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await authService.verifyResetPassword(resetEmail, fullOtp);
      setSuccessMessage('OTP verified! Enter your new password.');
      setTimeout(() => switchView('enter-new-password'), 1000);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 7. SUBMIT NEW PASSWORD
  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await authService.resetPassword(resetEmail, newPassword);
      setSuccessMessage('Password successfully reset! Please login.');
      setTimeout(() => switchView('login'), 1500);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer" onClick={handleCloseModal} />

      <div className="relative bg-white grid login-container rounded-xl shadow-2xl p-8 z-10 max-w-sm w-full mx-auto border border-gray-100 max-h-[95vh] overflow-y-auto">
        
        <button 
          type="button"
          onClick={handleCloseModal}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 font-bold text-xl cursor-pointer"
        >
          &times;
        </button>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg mb-3 border border-red-200 text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 text-green-600 text-xs font-semibold p-3 rounded-lg mb-3 border border-green-200 text-center">
            {successMessage}
          </div>
        )}

        {/* SIGNUP FORM */}
        {currentView === 'signup' && (
          <div className="container text-center">
            <main className="form-area mt-2">
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
                    <option value="institution">Institution (Business/Bank/Clinic)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="username" className="block text-xs font-bold uppercase text-gray-400 mb-1">Username:</label>
                  <input className="border border-gray-200 rounded-xl py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="Enter your username" required />
                </div>

                <div className="input-group">
                  <label htmlFor="email" className="block text-xs font-bold uppercase text-gray-400 mb-1">Email Address:</label>
                  <input className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required />
                </div>

                <div className="input-group">
                  <label htmlFor="password" className="block text-xs font-bold uppercase text-gray-400 mb-1">Password:</label>
                  <input className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase text-gray-400 mb-1">Confirm Password:</label>
                  <input className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="••••••••" required />
                </div>
                
                <button type="submit" disabled={loading} className="btn-primary bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer mt-3">
                  {loading ? 'Sending OTP...' : `Sign Up as ${role === 'user' ? 'User' : 'Institution'}`}
                </button>

                <button type="button" className="switch-page text-blue-500 hover:text-blue-700 text-sm font-semibold my-2 cursor-pointer bg-transparent border-none text-center w-full" onClick={() => switchView('login')}> 
                  already have an account Login?
                </button>
              </form>
            </main>
          </div>
        )}

        {/* REGISTRATION OTP VERIFICATION FORM */}
        {currentView === 'otp' && (
          <div className="text-center py-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Verify Email</h2>
            <p className="text-xs text-gray-500 mb-6">Enter the 6-digit code sent to <br /><span className="font-semibold text-gray-700">{formData.email}</span></p>

            <form onSubmit={handleVerifyOtpSubmit}>
              <div className="flex justify-between gap-1.5 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-digit-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, index, 'register')}
                    onKeyDown={(e) => handleOtpKeyDown(e, index, 'register')}
                    className="w-10 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ))}
              </div>

              {role === 'user' && (
                <div className="space-y-4 mb-4 text-left">
                  <div className="input-group">
                    <label htmlFor="address" className="block text-xs font-bold uppercase text-gray-400 mb-1">Address</label>
                    <input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="phone" className="block text-xs font-bold uppercase text-gray-400 mb-1">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              )}

              {role === 'institution' && (
                <div className="space-y-4 mb-4 text-left">
                  <div className="input-group">
                    <label htmlFor="institution_name" className="block text-xs font-bold uppercase text-gray-400 mb-1">Institution Name</label>
                    <input
                      id="institution_name"
                      name="institution_name"
                      value={formData.institution_name}
                      onChange={handleInputChange}
                      placeholder="Enter institution or business name"
                      className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="address" className="block text-xs font-bold uppercase text-gray-400 mb-1">Address</label>
                    <input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter institution address"
                      className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="phone" className="block text-xs font-bold uppercase text-gray-400 mb-1">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter contact phone number"
                      className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="website" className="block text-xs font-bold uppercase text-gray-400 mb-1">Website</label>
                    <input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="Enter website URL"
                      className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="description" className="block text-xs font-bold uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Short description of your institution"
                      className="border border-gray-200 rounded-xl py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer mb-3">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="flex justify-between items-center text-xs mt-3">
              <button type="button" onClick={handleResendOtp} className="text-blue-500 hover:text-blue-700 font-semibold cursor-pointer border-none bg-transparent">Resend Code</button>
              <button type="button" onClick={() => switchView('signup')} className="text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent">← Back to Signup</button>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {currentView === 'login' && (
          <div className="text-center">
            <h1 className="py-2 text-2xl font-black text-gray-900">NOQ Login</h1>
            <p className="text-sm text-gray-500">skip the wait, not the queue</p>
            <p className="text-sm text-gray-500 mb-4">sign in to your account.</p>
            <p className="text-xs text-gray-400">new here?</p> 
            <p className="mb-4">
              <button type="button" className="text-blue-500 hover:text-blue-700 text-sm font-semibold cursor-pointer bg-transparent border-none" onClick={() => switchView('signup')}>
                create an account?
              </button>
            </p> 

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold uppercase text-gray-400 mb-1">Email Address:</label>
                <input className="border border-gray-200 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" id="login-email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Enter your email" />
              </div>
              
              <div>
                <label htmlFor="login-password" className="block text-xs font-bold uppercase text-gray-400 mb-1">Password:</label>
                <input className="border border-gray-200 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" id="login-password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="Enter your password" />
              </div>
              
              <div className="text-right">
                <button type="button" onClick={() => switchView('request-reset')} className="text-xs text-blue-500 hover:text-blue-700 font-semibold bg-transparent border-none cursor-pointer">
                  Forgot password?
                </button>
              </div>

              <button disabled={loading} className="login-btn bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer" type="submit">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        )}

        {/* 1. REQUEST RESET PASSWORD FORM */}
        {currentView === 'request-reset' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h2>
            <p className="text-xs text-gray-500 mb-6">Enter your email address to receive a password reset code.</p>

            <form onSubmit={handleRequestResetSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold uppercase text-gray-400 mb-1">Email Address:</label>
                <input 
                  className="border border-gray-200 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="email" 
                  id="reset-email" 
                  value={resetEmail} 
                  onChange={(e) => setResetEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email" 
                />
              </div>

              <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer">
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>

            <div className="text-center mt-4 text-xs">
              <button type="button" onClick={() => switchView('login')} className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer">
                ← Back to Login
              </button>
            </div>
          </div>
        )}

        {/* 2. VERIFY RESET OTP FORM */}
        {currentView === 'verify-reset-otp' && (
          <div className="text-center py-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enter Reset OTP</h2>
            <p className="text-xs text-gray-500 mb-6">Enter the 6-digit verification code sent to <br /><span className="font-semibold text-gray-700">{resetEmail}</span></p>

            <form onSubmit={handleVerifyResetOtpSubmit}>
              <div className="flex justify-between gap-1.5 mb-6">
                {resetOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`reset-otp-digit-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, index, 'reset')}
                    onKeyDown={(e) => handleOtpKeyDown(e, index, 'reset')}
                    className="w-10 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer mb-3">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className="text-center mt-3 text-xs">
              <button type="button" onClick={() => switchView('request-reset')} className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer">
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* 3. ENTER NEW PASSWORD FORM */}
        {currentView === 'enter-new-password' && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">New Password</h2>
            <p className="text-xs text-gray-500 mb-4">Please set your new secure password.</p>

            <form onSubmit={handleNewPasswordSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label htmlFor="new-password" className="block text-xs font-bold uppercase text-gray-400 mb-1">New Password:</label>
                <input 
                  className="border border-gray-200 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="password" 
                  id="new-password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                />
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block text-xs font-bold uppercase text-gray-400 mb-1">Confirm New Password:</label>
                <input 
                  className="border border-gray-200 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="password" 
                  id="confirm-new-password" 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                />
              </div>

              <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer">
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default NoqLogin;