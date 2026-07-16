import LandingPage from "./pages/LandingPage";
import './index.css' 
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';


function App() {
  return( 
  <Router >
    <div className="w-full"> 
      <AppRoutes />
    </div>
  </Router>
  )

}

export default App;