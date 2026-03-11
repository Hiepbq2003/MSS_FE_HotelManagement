import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaHotel, FaBed, FaSignOutAlt } from 'react-icons/fa'; // Cần cài đặt react-icons


const ReceptionSidebar = () => {
    const location = useLocation(); 
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };
    return (
      
        <div style={{ width: '250px', height: '100vh', position: 'fixed', zIndex: 1000 }} className="bg-dark text-white shadow">
            
            <h4 className="p-3 text-center border-bottom border-secondary text-warning">
                Trang của tiếp tân
            </h4>

            <Nav className="flex-column p-2">
                
                <Nav.Link 
                    as={Link} 
                    to="/reception/check-in" 
                    className={`text-white ${location.pathname === '/reception/check-in' ? 'bg-primary rounded' : ''}`}
                >
                    <FaTachometerAlt className="me-2" /> Check In
                </Nav.Link>

                <Nav.Link 
                    as={Link} 
                    to="/reception/check-in-booking" 
                    className={`text-white ${location.pathname === '/reception/check-in-booking' ? 'bg-primary rounded' : ''}`}
                >
                    <FaTachometerAlt className="me-2" /> Check In for Booking
                </Nav.Link>

                <hr className="bg-secondary my-2" />
                
                <Nav.Link 
                    as={Link} 
                    to="/reception/check-out" 
                    className={`text-white ${location.pathname === '/reception/check-out' ? 'bg-primary rounded' : ''}`}
                >
                    <FaHotel className="me-2" /> Check Out
                </Nav.Link>

                <Nav.Link 
                    as={Link} 
                    to="/reception/check-room" 
                    className={`text-white ${location.pathname === '/reception/check-room' ? 'bg-primary rounded' : ''}`}
                >
                    <FaBed className="me-2" /> Room Manager
                </Nav.Link>

                <hr className="bg-secondary my-2" />

                {/* Logout */}
                <Nav.Link 
                    onClick={handleLogout} // Thay bằng logic logout thực tế
                    className="text-danger mt-3"
                >
                    <FaSignOutAlt className="me-2" /> Đăng xuất
                </Nav.Link>

            </Nav>
        </div>
    );
};

export default ReceptionSidebar;