import React from 'react';
import { Container, Row, Col, Button, Card } from "react-bootstrap";
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

    // List of rooms
    const rooms = [
        {
            image:
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
            title: "Premier Connecting Room",
            price: 159,
            desc: "Spacious room with modern design and stunning city views.",
        },
        {
            image:
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
            title: "Grand Balcony Suite",
            price: 189,
            desc: "An elegant blend of comfort and a touch of luxury for your stay.",
        },
        {
            image:
                "https://www.exoticadubai.tajhotels.com/wp-content/uploads/sites/470/2025/08/Grand-Luxury-Suite-Sea-View-With-Open-Jacuzzi-5-2000x1000.jpg",
            title: "Luxury Suite",
            price: 249,
            desc: "Enjoy full premium facilities and panoramic, breathtaking views.",
        },
        {
            image:
                "https://media.architecturaldigest.com/photos/669fc8c773a9e24e074ed817/4:3/w_5572,h_4179,c_limit/design%20by%20Shannon%20Eddings%20Interiors%20photo%20by%20Molly%20Culver%20Photography.jpg",
            title: "Grand Connecting Room",
            price: 199,
            desc: "Perfectly suited for family vacations, featuring large space and a cozy feel.",
        },
    ];

    return (
        <>
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

            {/* Our Rooms Section */}
            <Container fluid style={{ marginTop: "80px", marginBottom: "100px" }}>
                <div style={{ textAlign: "center", marginBottom: "60px" }}>
                    <p
                        style={{
                            textTransform: "uppercase",
                            color: "var(--main-color)",
                            fontWeight: 600,
                            marginBottom: "8px",
                        }}
                    >
                        Our Rooms
                    </p>
                    <h1 style={{ fontWeight: 700 }}>Explore Our Luxury Rooms</h1>
                </div>

                <Row className="justify-content-center g-4">
                    {rooms.map((room, i) => (
                        <Col key={i} lg={3} md={6} sm={12}>
                            <Card
                                style={{
                                    border: "none",
                                    overflow: "hidden",
                                    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-8px)";
                                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                                }}
                            >
                                <Card.Img
                                    variant="top"
                                    src={room.image}
                                    alt={room.title}
                                    style={{
                                        height: "240px",
                                        objectFit: "cover",
                                    }}
                                />
                                <Card.Body style={{ padding: "25px" }}>
                                    <Card.Title
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "1.25rem",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        {room.title}
                                    </Card.Title>
                                    <Card.Text
                                        style={{
                                            color: "#666",
                                            fontSize: "15px",
                                            lineHeight: "1.8",
                                            marginBottom: "20px",
                                            minHeight: "48px",
                                        }}
                                    >
                                        {room.desc}
                                    </Card.Text>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: "var(--main-color)",
                                                fontWeight: 700,
                                                fontSize: "18px",
                                            }}
                                        >
                                            {room.price}$ <span style={{ color: "#888", fontWeight: 400 }}>/night</span>
                                        </span>
                                        <Button
                                            variant="outline-dark"
                                            style={{
                                                borderRadius: 0,
                                                letterSpacing: "1px",
                                                fontWeight: 500,
                                                textTransform: "uppercase",
                                                padding: "6px 14px",
                                                fontSize: "13px",
                                            }}
                                        >
                                            More details
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default ServiceSection;