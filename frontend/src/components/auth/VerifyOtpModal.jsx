import React, { useState, useEffect } from 'react';
import API from '../../services/api';

function VerifyOtpModal({ isOpen, email, onClose, onSuccess }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setErrorMessage('');
      setResendStatus('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle single digit inputs with auto-focus to next box
  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (/[^0-9]/.test(value) && value !== '') return; // Accept only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input box
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  // Submit OTP to /auth/verify_register
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Matches VerifyEmailSchema: { email, otp }
      const response = await API.post('/auth/verify_register', {
        email,
        otp: fullOtp,
      });
      const data = response.data;

      if (!data) {
        throw new Error('OTP Verification failed.');
      }

      // Backend returns UserResponseSchema on success (201 CREATED)
      if (onSuccess) {
        onSuccess(data); // Pass back user object ({ id, name, role, email })
      }

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP via /auth/resend_otp
  const handleResendOtp = async () => {
    setResendStatus('Sending new code...');
    setErrorMessage('');

    try {
      // Matches EmailSchema: { email }
      const response = await API.post('/auth/resend_otp', { email });
      const data = response.data;
      if (!data) {
        throw new Error('Failed to resend code.');
      }

      setResendStatus('A new code has been sent to your email.');
    } catch (error) {
      setErrorMessage(error.message);
      setResendStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-xl shadow-2xl p-8 z-10 max-w-sm w-full mx-auto border border-gray-100 text-center">
        
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 font-bold text-xl cursor-pointer"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Verify Your Email</h2>
        <p className="text-xs text-gray-500 mb-6">
          We sent a verification code to <br />
          <span className="font-semibold text-gray-700">{email}</span>
        </p>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg mb-4 border border-red-200">
            {errorMessage}
          </div>
        )}

        {resendStatus && (
          <div className="bg-blue-50 text-blue-600 text-xs font-semibold p-3 rounded-lg mb-4 border border-blue-200">
            {resendStatus}
          </div>
        )}

        <form onSubmit={handleVerifySubmit}>
          {/* 6 Digit Box Inputs */}
          <div className="flex justify-between gap-2 mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleOtpChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl w-full transition cursor-pointer mb-4"
          >
            {loading ? 'Verifying...' : 'Verify & Complete Sign Up'}
          </button>
        </form>

        <p className="text-xs text-gray-500">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-blue-500 hover:text-blue-700 font-semibold cursor-pointer border-none bg-transparent"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtpModal;