import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../../pages/CommonPage/HomePage/HomePage";
import AboutUs from "../../pages/CommonPage/HomePage/AboutUs";
import SelectServicePage from "../../pages/CommonPage/ServicePackages/ServicePackages";

const RoutesApp = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking/service" element={<SelectServicePage />} />
      <Route path="/about" element={<AboutUs />} />
    </Routes>
  );
};

export default RoutesApp;
