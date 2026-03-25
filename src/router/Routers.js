import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from "../publicPage/Layout";
import Home from "../publicPage/Home/Home";
import Rooms from "../publicPage/Rooms";
import RoomDetail from "../publicPage/RoomDetail";
import Login from "../publicPage/Login/Login";
import AboutUs from "../publicPage/AboutUs";
import Contact from "../publicPage/Contact";
import RoomTypeManagement from "../manager/RoomTypeManagement";
import DashBoard from "../admin/DashBoard";
import Manager from "../manager/Manager";
import Profile from "../publicPage/Profile";
import CheckInPage from "../staffPage/CheckInPage";
import Reception from "../staffPage/Reception";
import CheckOutPage from "../staffPage/CheckOutPage";
import CheckRoom from "../staffPage/CheckRoom";
import Admin from "../admin/Admin";
import UserManagement from "../admin/UserManagement";
import CustomerManagement from "../adminArea/CustomerManagement";
import ServiceManagement from "../manager/ServiceManagement";
import RoomManagement from "../manager/RoomManagement";
import HotelAmenityManagement from "../manager/HotelAmenityManagement";
import PaymentResult from "../publicPage/PaymentResult";
import BookingPage from "../publicPage/BookingPage";
import CheckInforBooking from "../staffPage/CheckInforBooking";
import HouseKeepingDashboard from "../housekeepingPage/HouseKeepingDashboard";
import HousekeepingManagement from "../admin/HousekeepingManagement";
import VoucherManagement from "../admin/VoucherManagement";
import ManagerDashboard from '../manager/ManagerDashboard';
import MyBookingsPage from '../publicPage/MyBookingsPage';
import BookingDetailPage from '../publicPage/BookingDetailPage';
import BookingManagement from '../manager/BookingManagement';
function Routers() {
  return (
    <HashRouter>
      <Routes>
        {/* Layout chung cho trang public */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="rooms/:id" element={<RoomDetail />} />
          <Route path="booking/:id" element={<BookingPage />}/>
          <Route path="payment-result" element={<PaymentResult />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-bookings" element={<MyBookingsPage/>} />
          <Route path="booking_detail/:id" element={<BookingDetailPage/>} />
        </Route>
        
        {/* Các route riêng */}
        <Route path="/login" element={<Login />} />

        {/* ROUTE DÀNH CHO MANAGER */}
        <Route path="/manager" element={<Manager />}>
          <Route index element={<DashBoard />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="room-types" element={<RoomTypeManagement />} />
          <Route path="service-management" element={<ServiceManagement />} />
          <Route path="room-management" element={<RoomManagement />} />
          <Route path="customer-management" element={<CustomerManagement />} />
          <Route path="amenities" element={<HotelAmenityManagement />} />
          <Route path="booking-management" element={<BookingManagement />} />
        </Route>

        {/* *** ROUTE DÀNH CHO ADMIN *** */}
        <Route path="/admin" element={<Admin />}>
          <Route index element={<DashBoard />} />
          <Route path="dashboard" element={<DashBoard />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="customer-management" element={<CustomerManagement />} />
          <Route path="room-management" element={<RoomManagement />} />
          <Route path="voucher-management" element={<VoucherManagement />} />
          <Route path="housekeeping-management" element={<HousekeepingManagement />} />
        </Route>

        {/* ROUTE DÀNH CHO RECEPTIONIST */}
        <Route path="/reception" element={<Reception />}>
          <Route index element={<CheckInPage />} />
          <Route path="check-in" element={<CheckInPage />} />
          <Route path="check-in-booking" element={<CheckInforBooking />} />
          <Route path="check-out" element={<CheckOutPage />} />
          <Route path="check-room" element={<CheckRoom />} />
        </Route>

        {/* ROUTE DÀNH CHO HOUSEKEEPING STAFF */}
        <Route path="/housekeeping" element={<HouseKeepingDashboard />} />
        
        {/* Route 404 để debug */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </HashRouter>
  );
}

export default Routers;