// File: TroNhanh_FE/src/routes/OwnerRoutes/RoutesOw.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import OwnerLayout from "../../pages/OwnerPage/Components/Layout/OwnerLayout";
import ProfilePage from "../../pages/OwnerPage/OwnerInfo/PersonalInfo";
import Accommodation from "../../pages/OwnerPage/Accommodation/accommodation";
import Statistics from "../../pages/OwnerPage/Statistics/Statistics";
import Report from "../../pages/OwnerPage/Report/report";
import Rating from "../../pages/OwnerPage/Rating/rating";
import DetailRating from "../../pages/OwnerPage/Rating/DetailRating";
import Communication from "../../pages/OwnerPage/Communication/communication";
import Membership from "../../pages/OwnerPage/MemberShip/membership";
import ContractManagement from "../../pages/OwnerPage/Contract/ContractManagement";
import PendingBookings from "../../pages/OwnerPage/PendingBookings/PendingBookings";
import OwnerVisitRequests from "../../pages/OwnerPage/VisitRequest/OwnerVisitRequests";
import PaymentResult from "../../pages/OwnerPage/MemberShip/PaymentResult"
const RoutesOw = () => {
  return (
    <Routes>
      <Route element={<OwnerLayout />}>
        <Route index element={<ProfilePage />} />
        <Route path="user-profile" element={<ProfilePage />} />
        <Route path="boarding-house" element={<Accommodation />} />
        <Route path="contract" element={<ContractManagement />} />
        <Route path="pending-bookings" element={<PendingBookings />} />
        <Route path="report" element={<Report />} />
        <Route path="rating" element={<Rating />} />
        <Route path="rating/:id" element={<DetailRating />} />
        <Route path="communication" element={<Communication />} />
        <Route path="visit-requests" element={<OwnerVisitRequests />} />
        <Route path="membership-result" element={<PaymentResult />} />
        <Route path="membership" element={<Membership />} />
        <Route path="statistics" element={<Statistics />} />

      </Route>

    </Routes>
  );
};

export default RoutesOw;
