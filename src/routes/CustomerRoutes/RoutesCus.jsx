import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import CustomerLayout from "../../pages/CustomerPage/components/layout/CustomerLayout";
// import ApartmentSearch from "../../pages/CustomerPage/ApartmentSearch/ApartmentSearch";
// import ApartmentDetails from "../../pages/CustomerPage/ApartmentDetails/ApartmentDetails";
// import CheckoutPage from "../../pages/CustomerPage/Checkout/CheckoutPage";
// import BookingResult from "../../pages/CustomerPage/Checkout/BookingResult";
// import ReportPage from "../../pages/CustomerPage/Report/ReportPage";
// import RoommateCommunity from "../../pages/CustomerPage/RoommateCommunity/RoommateCommunity";
// import Communication from "../../pages/CustomerPage/Communication/communication";
// import RentalContract from "../../pages/CustomerPage/Contract/RentalContract";
// import MyBookings from "../../pages/CustomerPage/CustomerBooking/MyBookings";

import Profile from "../../pages/CommonPage/Profile/Profile";

const RoutesCus = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        {/* <Route index element={<ApartmentSearch />} />
        <Route path="search" element={<ApartmentSearch />} />
        <Route path="property/:id" element={<ApartmentDetails />} />
        <Route path="contract/:boardingHouseId/:roomId" element={<RentalContract />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="booking-result" element={<BookingResult />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="communication" element={<Communication />} />
        <Route path="roommates" element={<RoommateCommunity />} /> */}

        <Route path="profile/*" element={<Profile />} />

      </Route>
    </Routes>
  );
};

export default RoutesCus;