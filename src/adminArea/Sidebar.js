import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaHotel, FaUsers, FaBed, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ role }) => { 
    const userRole = role ? role.toUpperCase() : '';
    const location = useLocation();
    const navigate = useNavigate();

    const isAdmin = userRole === 'ADMIN';
    const isManager = userRole === 'MANAGER';
    const isManagerOrAdmin = isAdmin || isManager;

    const canSeeManagerLinks = isManager;
    const canManageUsers = isAdmin;

    const basePath = isAdmin ? '/admin' : (isManager ? '/manager' : '');

    if (!isManagerOrAdmin) return null;

    // ✅ Standard Logout Function
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{ width: '250px', height: '100vh', position: 'fixed', zIndex: 1000 }} className="bg-dark text-white shadow">
            <h4 className="p-3 text-center border-bottom border-secondary text-warning">
                {userRole} Dashboard
            </h4>

            <Nav className="flex-column p-2">

                <Nav.Link
                    as={Link}
                    to={`${basePath}/dashboard`}
                    className={`text-white ${location.pathname === `${basePath}/dashboard` ? 'bg-primary rounded' : ''}`}
                >
                    <FaTachometerAlt className="me-2" /> Dashboard
                </Nav.Link>

                {canSeeManagerLinks && (
                    <Nav.Link
                        as={Link}
                        to={`${basePath}/hotels`}
                        className={`text-white ${location.pathname === `${basePath}/hotels` ? 'bg-primary rounded' : ''}`}
                    >
                        <FaHotel className="me-2" /> Hotel Management
                    </Nav.Link>
                )}

                <hr className="bg-secondary my-2" />

                {canSeeManagerLinks && (
                    <Nav.Link
                        as={Link}
                        to={`${basePath}/room-management`}
                        className={`text-white ${location.pathname === `${basePath}/room-management` ? 'bg-primary rounded' : ''}`}
                    >
                        <FaBed className="me-2" /> Room Management
                    </Nav.Link>
                )}

                {canSeeManagerLinks && (
                    <Nav.Link
                        as={Link}
                        to={`${basePath}/amenities`}
                        className={`text-white ${location.pathname === `${basePath}/amenities` ? 'bg-primary rounded' : ''}`}
                    >
                        <FaBed className="me-2" /> Hotel Amenities
                    </Nav.Link>
                )}

                {canSeeManagerLinks && (
                    <Nav.Link
                        as={Link}
                        to={`${basePath}/service-management`}
                        className={`text-white ${location.pathname === `${basePath}/service-management` ? 'bg-primary rounded' : ''}`}
                    >
                        <FaHotel className="me-2" /> Service Management
                    </Nav.Link>
                )}

                {canSeeManagerLinks && (
                    <Nav.Link
                        as={Link}
                        to={`${basePath}/room-types`}
                        className={`text-white ${location.pathname === `${basePath}/room-types` ? 'bg-primary rounded' : ''}`}
                    >
                        <FaBed className="me-2" /> Room Types
                    </Nav.Link>
                )}

                {isManagerOrAdmin && (
                    <Nav.Link
                        as={Link}
                        to={`${basePath}/customer-management`}
                        className={`text-white ${location.pathname === `${basePath}/customer-management` ? 'bg-primary rounded' : ''}`}
                    >
                        <FaUsers className="me-2" /> Customer Management
                    </Nav.Link>
                )}

                {canManageUsers && (
                    <Nav.Link
                        as={Link}
                        to={`${basePath}/user-management`}
                        className={`text-white ${location.pathname === `${basePath}/user-management` ? 'bg-primary rounded' : ''}`}
                    >
                        <FaUsers className="me-2" /> Staff Management
                    </Nav.Link>
                )}

                <hr className="bg-secondary my-2" />

                {/* ✅ Logout Button */}
                <Nav.Link
                    onClick={handleLogout}
                    className="text-danger mt-3"
                >
                    <FaSignOutAlt className="me-2" /> Logout
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default Sidebar;
