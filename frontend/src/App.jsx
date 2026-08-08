import LandingPage from "./pages/LandingPage";
import './index.css'; 
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const controller = new AbortController();

    fetch("http://127.0.0.1:8000/", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Backend Connected:", data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error("❌ Backend Not Connected:", err);
        }
      });

    // Cleanup running fetch on unmount
    return () => controller.abort();
  }, []);

  return ( 
    <Router>
      <div className="w-full" translate="no"> 
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;