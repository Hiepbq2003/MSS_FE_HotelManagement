import React from 'react';
import { Container, Row, Col } from "react-bootstrap";
import {
    FaMapMarkerAlt,
    FaUtensils,
    FaBaby,
    FaTshirt,
    FaCar,
    FaCocktail,
} from "react-icons/fa";

const ServiceSection = () => {
    // List of services
    const services = [
        { icon: <FaMapMarkerAlt />, title: "Travel Plan" },
        { icon: <FaUtensils />, title: "Catering Service" },
        { icon: <FaBaby />, title: "Babysitting" },
        { icon: <FaTshirt />, title: "Laundry" },
        { icon: <FaCar />, title: "Hire Driver" },
        { icon: <FaCocktail />, title: "Bar & Drink" },
    ];

    return (
        <Container style={{ textAlign: "center", marginBottom: "120px" }}>
            <p
                style={{
                    textTransform: "uppercase",
                    color: "var(--main-color)",
                    fontWeight: 700,
                    marginBottom: "10px",
                }}
            >
                What We Do
            </p>
            <h1
                style={{
                    fontWeight: 700,
                    fontSize: "2.5rem",
                    marginBottom: "60px",
                }}
            >
                Discover Our Services
            </h1>

            <Row className="justify-content-center">
                <Col lg={10}>
                    <Row className="justify-content-center g-3">
                        {services.map((service, i) => (
                            <Col key={i} lg={4} md={6} sm={12}>
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "30px 10px",
                                        backgroundColor: "#fff",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "var(--main-color)";
                                        e.currentTarget.querySelector("svg").style.color = "#fff";
                                        e.currentTarget.querySelector("h5").style.color = "#fff";
                                        e.currentTarget.querySelector("p").style.color = "#f0f0f0";
                                        e.currentTarget.style.transform = "translateY(-8px)";
                                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "#fff";
                                        e.currentTarget.querySelector("svg").style.color = "var(--main-color)";
                                        e.currentTarget.querySelector("h5").style.color = "#000";
                                        e.currentTarget.querySelector("p").style.color = "#555";
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "2.5rem",
                                            marginBottom: "20px",
                                            color: "var(--main-color)",
                                            transition: "color 0.3s",
                                        }}
                                    >
                                        {service.icon}
                                    </div>
                                    <h5
                                        style={{
                                            fontWeight: 600,
                                            marginBottom: "10px",
                                            transition: "color 0.3s",
                                        }}
                                    >
                                        {service.title}
                                    </h5>
                                    <p
                                        style={{
                                            color: "#555",
                                            fontSize: "15px",
                                            lineHeight: "1.8",
                                            transition: "color 0.3s",
                                        }}
                                    >
                                        Experience top-notch hospitality services designed to cater to your every need, ensuring a seamless and comfortable stay.
                                    </p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default ServiceSection;