import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HeaderComponent from './components/header/header';
import FooterComponent from './components/footer/footer';
import RoutesAd from './routes/AdminRoutes/RoutesAd';
import RoutesCus from './routes/CustomerRoutes/RoutesCus';
import RoutesOw from './routes/OwnerRoutes/RoutesOw';
import RoutesApp from './routes/AppRoutes/RoutesApp';
import ExceptionRoutes from './routes/ExceptionRoutes/ExceptionRoutes';
import LoginPage from './pages/CustomerPage/Auth/LoginPage';
import RegisterPage from './pages/CustomerPage/Auth/RegisterPage';
import { initAutoLogout, stopAutoLogout } from './services/autoLogout';
import useUser, { UserProvider } from './contexts/UserContext';
import { setupInterceptors } from './services/api';
import AboutUs from "./pages/CommonPage/HomePage/AboutUs";
import VerifyOtpPage from './pages/CustomerPage/Auth/VerifyOTP';
import ForgotPasswordPage from './pages/CustomerPage/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/CustomerPage/Auth/ResetPasswordPage';
import ScrollToTop from './pages/CommonPage/ScrollToTop/ScrollToTop';
import LogoutWarningModal from './components/LogoutWarningModal';
import AIAssistant from './utils/AIAssistant';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
// import PaymentCountdown from './pages/CustomerPage/Checkout/PaymentCountdown'; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet"></link>

function AppRoutes() {
  const location = useLocation();
  const { logout, loading } = useUser();


  useEffect(() => {
    setupInterceptors(logout);
  }, [logout]);


  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem('token');
    if (isLoggedIn) {
      initAutoLogout(logout);
    } else {
      stopAutoLogout();
    }
    return () => {
      stopAutoLogout();
    };
  }, [location, logout]);

  if (loading) return <p>Loading...</p>;

  const hideLayout = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password", "/payment-countdown",
    "/payment-cancel"].some(path => location.pathname.startsWith(path));
  return (
    <>
      {!hideLayout && <HeaderComponent />}

      <main className="main-container" style={{ marginTop: hideLayout ? '0px' : '80px' }}>
        <Routes>
          <Route index element={<Navigate to="/homepage" replace />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Auth routes */}

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          {/* App routes */}
          <Route path="/homepage" element={<RoutesApp />} />
          <Route path="/owner/*" element={<RoutesOw />} />
          <Route path="/admin/*" element={<RoutesAd />} />
          <Route path="/customer/*" element={<RoutesCus />} />
          {/* <Route path="/payment-countdown" element={<PaymentCountdown />} /> */}


          {/* Exception route */}
          <Route path="*" element={<ExceptionRoutes />} />
        </Routes>
      </main>
      <LogoutWarningModal />
      {!hideLayout && <FooterComponent />}
    </>
  );
}


function AppWrapper() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <AIAssistant />
    </BrowserRouter>
  );
}


export default AppWrapper;