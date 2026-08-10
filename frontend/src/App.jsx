import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useEffect, useState } from "react";
import API from './services/api';
import './index.css'; 

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [backendError, setBackendError] = useState(null);

  /**
   * Check if backend is accessible on component mount
   * Uses the shared API client so auth proxy and cookies are preserved.
   */
  useEffect(() => {
    const checkBackendConnection = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);  // 5 second timeout

      try {
        const response = await API.get('/', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });

        if (response.status === 200) {
          console.log("✅ Backend Connected:", response.data);
          setBackendStatus('connected');
          setBackendError(null);
        } else {
          throw new Error(`Backend returned status ${response.status}`);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn("⏱️ Backend connection timeout");
          setBackendError('Backend connection timeout');
        } else {
          console.error("❌ Backend Not Connected:", err.message);
          setBackendError(err.message);
        }
        setBackendStatus('disconnected');
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkBackendConnection();
  }, []);

  return (
    <Router>
      <div className="w-full" translate="no">
        {/* Show warning if backend is not connected */}
        {backendStatus === 'disconnected' && (
          <div className="fixed top-0 left-0 right-0 bg-red-100 border-b border-red-400 text-red-700 px-4 py-3 text-sm z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span>
                ⚠️ <strong>Backend Connection Error:</strong> {backendError || 'Unable to reach backend server'}
              </span>
              <button 
                onClick={() => setBackendStatus('checking')}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Show loading state while checking connection */}
        {backendStatus === 'checking' && (
          <div className="fixed top-0 left-0 right-0 bg-blue-100 border-b border-blue-400 text-blue-700 px-4 py-3 text-sm z-50">
            <div className="max-w-7xl mx-auto">
              🔄 Checking backend connection...
            </div>
          </div>
        )}

        {/* Main app routes */}
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;