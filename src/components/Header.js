import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Dropdown, Row, Col } from "react-bootstrap";
import { FaPhoneAlt, FaUser, FaFacebookF, FaTwitter, FaInstagram, FaTripadvisor } from "react-icons/fa";
import { TbMailFilled } from "react-icons/tb";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ 
        isLoggedIn: false, 
        fullName: '' 
    });

    const getUserInfo = () => {
        const token = localStorage.getItem('token');
        const storedFullName = localStorage.getItem('fullName') || 'Customer'; 
        
        setUser({
            isLoggedIn: !!token,
            fullName: storedFullName 
        });
    };

    const handleLogout = () => {
    
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('fullName');
        
        setUser({ isLoggedIn: false, fullName: '' });
        
        navigate('/login'); 
    };

    useEffect(() => {
        getUserInfo();
        window.addEventListener('storage', getUserInfo);

        return () => {
            window.removeEventListener('storage', getUserInfo);
        };
    }, []);

    const renderUserSection = () => {
        if (user.isLoggedIn) {
            return (
                <Dropdown align="end">
                    <Dropdown.Toggle
                        id="user-dropdown"
                        style={{
                            background: "none",
                            border: "none",
                            color: "#333",
                            fontWeight: 500,
                            padding: "14px 0",
                            boxShadow: "none"
                        }}
                    >
                        <FaUser style={{ marginBottom: "7px", marginRight: "5px" }} /> 
                        {user.fullName}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/profile">
                            Profile
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/my-bookings">
                            MyBookings
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>
                            Logout
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            );
        } else {
            // Chưa đăng nhập: Hiện link Login
            return (
                <Dropdown align="end">
                    <Dropdown.Toggle
                        id="user-dropdown"
                        style={{
                            background: "none",
                            border: "none",
                            color: "#333",
                            fontWeight: 500,
                            padding: "14px 0"
                        }}
                    >
                        <FaUser style={{ marginBottom: "7px" }} /> User
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/login">
                            Login
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            );
        }
    };
    
    // Danh sách menu đã loại bỏ "News" và "Shop"
    const navItems = ["Home", "Rooms", "About Us", "Contact"];

    const getPath = (item) => {
        switch (item) {
            case "Home":
                return "/"; 
            case "Rooms":
                return "/rooms";
            case "About Us":
                return "/about-us";
            case "Contact":
                return "/contact";
            default:
                return "/";
        }
    };

    return (
        <header>
            {/* --- Top Bar --- */}
            <Container fluid>
                <Row className='justify-content-center' style={{
                    borderBottom: "1px solid #e0e0e0",
                }}>
                    <Col md={9} >
                        <div>
                            <Container>
                                <Row className="align-items-center" >
                                    {/* Left: contact */}
                                    <Col lg={6}>
                                        <ul
                                            style={{
                                                display: "flex",
                                                gap: "20px",
                                                listStyle: "none",
                                                margin: 0,
                                                color: "#333",
                                                padding: "14px 0"
                                            }}
                                        >
                                            <li style={{ display: "flex", alignItems: "center", gap: "6px", paddingRight: "30px" }}>
                                                <FaPhoneAlt style={{ fontSize: "15px" }} /> (84) 345 67890
                                            </li>

                                            <li style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "0px" }}>
                                                <TbMailFilled style={{ fontSize: "15px" }} /> info.colorlib@gmail.com
                                            </li>
                                        </ul>
                                    </Col>

                                    {/* Right: social + book + user */}
                                    <Col lg={6} className="text-end">
                                        <div
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "25px",
                                            }}
                                        >
                                            {/* Social icons */}
                                            <div>
                                                {[FaFacebookF, FaTwitter, FaTripadvisor, FaInstagram].map((Icon, i) => (
                                                    <button
                                                        key={i}
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            color: "#333",
                                                            marginRight: "15px",
                                                            fontSize: "1.1rem",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => console.log("Clicked social icon")}
                                                    >
                                                        <Icon />
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Book button */}
                                            <Link to="/booking"
                                                style={{
                                                    backgroundColor: "var(--main-color)",
                                                    color: "#fff",
                                                    padding: "14px 24px",
                                                    paddingTop: "16px",
                                                    fontWeight: 500,
                                                    textDecoration: "none",
                                                    height: "auto"
                                                }}
                                            >
                                                BOOKING NOW
                                            </Link>

                                            {/* User dropdown (Conditional Rendering) */}
                                            {renderUserSection()}

                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </Col>
                </Row>
                {/* --- Navigation Bar --- */}
                <Row className='justify-content-center' style={{ backgroundColor: "white", borderBottom: "1px solid #eee" }}>
                    <Col lg={9} >
                        <Navbar expand="lg" >
                            <Container>
                                <Navbar.Brand as={Link} to="/" style={{ fontWeight: "bold", fontSize: "1.4rem", textTransform: "uppercase" }}>
                                    ✨<span style={{ color: '#FFBF58' }}>Mr.</span>STELLAR
                                </Navbar.Brand>
                                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                                <Navbar.Collapse id="basic-navbar-nav">
                                    <Nav className="ms-auto">
                                        {/* Sử dụng danh sách navItems mới */}
                                        {navItems.map((item, i) => (
                                            <NavLink
                                                key={i}
                                                to={getPath(item)} // Sử dụng hàm getPath để lấy đường dẫn
                                                className="nav-link"
                                                style={({ isActive }) => ({
                                                    color: isActive ? "var(--main-color)" : "#333",
                                                    marginLeft: "20px",
                                                    fontWeight: 500,
                                                    textDecoration: "none",
                                                    borderBottom: isActive ? "2px solid var(--main-color)" : "none",
                                                })}
                                            >
                                                {item}
                                            </NavLink>
                                        ))}
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                    </Col>
                </Row>
            </Container>
        </header>
    );
};

export default Header;