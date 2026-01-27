import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/CommonPage/LandingPage/LandingPage';

import ServicePackages from './pages/CommonPage/ServicePackages/ServicePackages';
import Profile from './pages/CommonPage/Profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        <Route path="/profile/*" element={<Profile />} />
        <Route path="/booking/service" element={<ServicePackages />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;