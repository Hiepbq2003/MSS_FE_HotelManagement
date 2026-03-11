import React from 'react';
import { Container, InputGroup, Row, Col, Form } from "react-bootstrap";
import { FaFacebookF, FaTwitter, FaInstagram, FaTripadvisor, FaHeart } from "react-icons/fa";
import { GrSend } from "react-icons/gr";

const Footer = () => {
    return (
        <footer style={{ marginTop: "40px" }}>
            {/* --- Footer Top --- */}
            <Row
                className="justify-content-center text-light text-center text-lg-start"
                style={{
                    backgroundColor: "#222736",
                    padding: "60px 0",
                }}
            >
                <Col lg={9}>
                    <Container>
                        <Row className="justify-content-between g-4">
                            {/* --- Left: Brand --- */}
                            <Col lg={4} md={6}>
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: "1.4rem",
                                        textTransform: "uppercase",
                                        marginBottom: "15px",
                                    }}
                                >
                                    ✨<span style={{ color: '#FFBF58' }}>Stella</span > Horizon
                                </div>
                                <p style={{ color: "#ccc", lineHeight: "1.6" }}>
                                    We inspire and reach millions of travelers <br />
                                    across 90 local websites.
                                </p>
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                    {[FaFacebookF, FaTwitter, FaTripadvisor, FaInstagram].map((Icon, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                fontSize: "1.1rem",
                                                width: "35px",
                                                height: "35px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "50%",
                                                border: "1px solid #555",
                                                color: "#fff",
                                                cursor: "pointer",
                                                transition: "all 0.3s",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "var(--main-color)";
                                                e.currentTarget.style.color = "#fff";
                                                e.currentTarget.style.borderColor = "var(--main-color)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                                e.currentTarget.style.color = "#fff";
                                                e.currentTarget.style.borderColor = "#555";
                                            }}
                                        >
                                            <Icon />
                                        </span>
                                    ))}
                                </div>

                            </Col>

                            {/* --- Middle: Contact --- */}
                            <Col lg={4} md={6}>
                                <p
                                    style={{
                                        fontWeight: "600",
                                        fontSize: "1.1rem",
                                        color: "var(--main-color)",
                                    }}
                                >
                                    CONTACT US
                                </p>
                                <div style={{ color: "#ccc", lineHeight: "1.8" }}>
                                    (12) 345 67890 <br />
                                    info.colorlib@gmail.com <br />
                                    856 Cordia Extension Apt. 356, Lake, <br />
                                    United States
                                </div>
                            </Col>

                            {/* --- Right: Newsletter --- */}
                            <Col lg={4} md={12}>
                                <p
                                    style={{
                                        fontWeight: "600",
                                        fontSize: "1.1rem",
                                        color: "var(--main-color)",
                                    }}
                                >
                                    NEW LATEST
                                </p>
                                <p style={{ color: "#ccc" }}>Get the latest updates and offers.</p>
                                <InputGroup className="mb-3" style={{ maxWidth: "300px" }}>
                                    <Form.Control
                                        placeholder="Your email"
                                        style={{
                                            border: "none",
                                            fontSize: "0.9rem",
                                        }}
                                    />
                                    <InputGroup.Text
                                        style={{
                                            backgroundColor: "var(--main-color)",
                                            color: "#fff",
                                            cursor: "pointer",
                                            border: "1px solid var(--main-color)",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#6d2b91";
                                            e.currentTarget.style.color = "light gray";
                                            e.currentTarget.style.borderColor = "#6d2b91";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "var(--main-color)";
                                            e.currentTarget.style.color = "#fff";
                                            e.currentTarget.style.borderColor = "var(--main-color)";
                                        }}
                                    >
                                        <GrSend />
                                    </InputGroup.Text>
                                </InputGroup>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>

            {/* --- Footer Bottom --- */}
            <Row
                className="justify-content-center text-center text-secondary text-lg-start"
                style={{
                    backgroundColor: "#1d2230",
                    padding: "15px 0",
                    paddingBottom: "60px"
                }}
            >
                <Col lg={9}>
                    <Container>
                        <Row className="align-items-center">
                            <Col lg={6}>
                                <ul
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "18px",
                                        listStyle: "none",
                                        margin: 0,
                                        padding: 0,
                                    }}
                                >
                                    <li>Contact</li>
                                    <li>Terms of Use</li>
                                    <li>Privacy</li>
                                    <li>Environmental Policy</li>
                                </ul>
                            </Col>
                            <Col lg={6} className="text-lg-end mt-3 mt-lg-0">
                                <div>
                                    Copyright ©2025 All rights reserved | This template is made with {" "}
                                    <FaHeart color="var(--main-color)" /><br />by <span style={{ color: 'var(--main-color)' }}>Colorlib</span>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </footer>
    );
};

export default Footer;
