import React from 'react';
import { Container, Nav, Navbar, Dropdown, Row, Col } from "react-bootstrap";
import { FaPhoneAlt, FaUser, FaFacebookF, FaTwitter, FaInstagram, FaTripadvisor } from "react-icons/fa";
import { TbMailFilled } from "react-icons/tb";

const Header = () => {
    return (
        <header>
            {/* --- Top Bar --- */}
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
                                            <FaPhoneAlt style={{ fontSize: "15px" }} /> (12) 345 67890
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
                                                <a
                                                    key={i}
                                                    href="#"
                                                    style={{
                                                        color: "#333",
                                                        marginRight: "15px",
                                                        fontSize: "1.1rem",
                                                        transition: "color 0.3s",
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--main-color)")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
                                                >
                                                    <Icon />
                                                </a>
                                            ))}
                                        </div>

                                        {/* Book button */}
                                        <a
                                            href="#"
                                            style={{
                                                backgroundColor: "var(--main-color)",
                                                color: "#fff",
                                                padding: "14px 24px",
                                                paddingTop:"16px",
                                                fontWeight: 500,
                                                textDecoration: "none",
                                                height:"auto"
                                            }}
                                        >
                                            BOOKING NOW
                                        </a>

                                        {/* User dropdown */}
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
                                                <Dropdown.Item href="#">Sign In</Dropdown.Item>
                                                <Dropdown.Item href="#">Sign Up</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
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
                            <Navbar.Brand href="#home" style={{ fontWeight: "bold", fontSize: "1.4rem", textTransform: "uppercase" }}>
                            ✨<span style={{ color: '#FFBF58' }}>Stella</span > Horizon
                            </Navbar.Brand>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="ms-auto">
                                    {["Home", "Rooms", "News", "About Us", "Shop", "Contact"].map((item, i) => (
                                        <Nav.Link
                                            key={i}
                                            href={"#" + item.toLowerCase()}
                                            style={{
                                                color: "#333",
                                                marginLeft: "20px",
                                                fontWeight: 500,
                                                transition: "color 0.3s",
                                                paddingBottom:"2px"
                                            }}
                                            onMouseEnter={(e) => (e.target.style.borderBottom = "2px solid var(--main-color)")}
                                            onMouseLeave={(e) => (e.target.style.borderBottom = "none")}
                                        >
                                            {item}
                                        </Nav.Link>
                                    ))}
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                </Col>
            </Row>

        </header>
    );
};

export default Header;
