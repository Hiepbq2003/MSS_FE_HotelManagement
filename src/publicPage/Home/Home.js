import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import ServiceSection from "./ServiceSection";
import TestimonialsSection from "./TestimonialsSection";
import api from "../../api/apiConfig";

const Home = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const blogs = [
        {
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
            category: "TRAVEL TRIP",
            title: "Tremblant In Canada",
            date: "15TH APRIL, 2019",
        },
        {
            image: "https://images.unsplash.com/photo-1518684079-3c830dcef090",
            category: "CAMPING",
            title: "Choosing A Static Caravan",
            date: "15TH APRIL, 2019",
        },
        {
            image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
            category: "EVENT",
            title: "Copper Canyon",
            date: "21TH APRIL, 2019",
        },
        {
            image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
            category: "EVENT",
            title: "Trip To Iqaluit In Nunavut A Canadian Arctic City",
            date: "08TH APRIL, 2019",
        },
        {
            image: "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9",
            category: "TRAVEL",
            title: "Traveling To Barcelona",
            date: "12TH APRIL, 2019",
        },
        {
            image: "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9",
            category: "TRAVEL",
            title: "Traveling To Barcelona",
            date: "12TH APRIL, 2019",
        },
    ];

    // Danh sách ảnh cho các loại phòng
    const ROOM_IMAGES = [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&h=350&fit=crop",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&h=350&fit=crop",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&h=350&fit=crop",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&h=350&fit=crop",
        "https://images.unsplash.com/photo-1582719478254-c79a62d4e7e3?w=500&h=350&fit=crop",
        "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=500&h=350&fit=crop"
    ];

    useEffect(() => {
        const fetchFeaturedRooms = async () => {
            try {
                const data = await api.get("/room-type/hotel/1");
                // Lấy 6 phòng đầu tiên để hiển thị
                const featuredRooms = data.slice(0, 3);
                setRooms(featuredRooms);
                setError(null);
            } catch (err) {
                console.error("Error fetching featured rooms:", err);
                setError("Không thể tải dữ liệu phòng");
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedRooms();
    }, []);

    const getRoomImage = (index) => {
        return ROOM_IMAGES[index % ROOM_IMAGES.length];
    };

   const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

    return (
        <>
            <HeroSection />
            
            {/* About us - Updated content for Mr.STELLAR */}
            <Container style={{ marginTop: "120px", marginBottom: "140px", paddingRight: "50px", paddingLeft: "100px" }}>
                <Row className="align-items-center">
                    {/* Left side: Text */}
                    <Col lg={6} md={12} style={{ paddingRight: "20px" }}>
                        <p
                            style={{
                                textTransform: "uppercase",
                                color: "var(--main-color)",
                                fontWeight: 700,
                            }}
                        >
                            About Us
                        </p>
                        <h1
                            style={{
                                fontWeight: 700,
                                fontSize: "2.8rem",
                                marginBottom: "25px",
                                lineHeight: "1.2",
                            }}
                        >
                            Mr.STELLAR Luxury <br />
                            Hotel
                        </h1>
                        <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.8" }}>
                            **Mr.STELLAR** is a premier luxury hotel, renowned for its exquisite service and sophisticated retreat spaces. We are dedicated to providing unforgettable experiences for all our guests.
                            <br />
                            <br />
                            With a prime location, modern rooms, and exceptional amenities, Mr.STELLAR is not just a place to stay, but an ideal destination for relaxation and discovery. Our mission is to illuminate your journey with unparalleled comfort.
                        </p>
                        <p
                            style={{
                                display: "inline-block",
                                fontWeight: 600,
                                borderBottom: "4px solid var(--main-color)",
                                paddingBottom: "5px",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/rooms")}
                        >
                            EXPLORE ROOMS
                        </p>
                    </Col>

                    {/* Right side: Images */}
                    <Col
                        lg={6}
                        md={12}
                        style={{
                            display: "flex",
                            flexDirection: "row", 
                            alignItems: "center", 
                            gap: "35px", 
                        }}
                    >
                        {/* Image 1 */}
                        <img
                            src="https://images.squarespace-cdn.com/content/v1/6484fbeb3187284c2d37c26d/1119053e-90c0-42b7-897d-d0d63b172689/PRJ-center11-cafe.jpg"
                            alt="Hotel exterior 1"
                            style={{
                                width: "50%", 
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                objectFit: "cover",
                                height: "420px", 
                            }}
                        />

                        {/* Image 2 */}
                        <img
                            src="https://a0.muscache.com/im/pictures/miso/Hosting-574118191615566465/original/c678f3b2-0d23-4055-8853-72a8725e177b.jpeg?im_w=720"
                            alt="Hotel exterior 2"
                            style={{
                                width: "50%",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                objectFit: "cover",
                                height: "420px",
                            }}
                        />
                    </Col>
                </Row>
            </Container>
            <hr style={{ marginBottom: "100px" }}></hr>

            {/* Featured Rooms Section */}
            <Container style={{ marginBottom: "100px" }}>
                <div style={{ textAlign: "center", marginBottom: "50px" }}>
                    <p
                        style={{
                            textTransform: "uppercase",
                            color: "var(--main-color)",
                            fontWeight: "600",
                            marginBottom: "8px",
                            letterSpacing: "2px",
                        }}
                    >
                        Our Rooms
                    </p>
                    <h1 style={{ fontWeight: "700", marginBottom: "10px" }}>Featured Accommodations</h1>
                    <p style={{ color: "#666", fontSize: "16px" }}>
                        Discover our carefully curated selection of luxurious rooms and suites
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3">Đang tải thông tin phòng...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-5">
                        <p className="text-muted">Tạm thời không thể hiển thị thông tin phòng</p>
                    </div>
                ) : (
                    <Row className="g-4">
                        {rooms.map((room, index) => (
                            <Col key={room.id} lg={4} md={6}>
                                <Card
                                    className="h-100 shadow-sm border-0"
                                    style={{
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-5px)";
                                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.1)";
                                    }}
                                    onClick={() => navigate(`/rooms/${room.id}`)}
                                >
                                    <Card.Img
                                        variant="top"
                                        src={getRoomImage(index)}
                                        alt={room.name}
                                        style={{
                                            height: "250px",
                                            objectFit: "cover",
                                        }}
                                    />

                                    <Card.Body style={{ padding: "25px" }}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <Card.Title style={{ fontWeight: "600", margin: 0 }}>
                                                {room.name}
                                            </Card.Title>
                                            <h5 style={{ color: "#f4b400", fontWeight: "bold", margin: 0 }}>
                                                {formatPrice(room.basePrice)}
                                                <span style={{ fontSize: "14px", color: "#666" }}>/night</span>
                                            </h5>
                                        </div>
                                        
                                        <p
                                            style={{
                                                color: "#6c757d",
                                                fontSize: "14px",
                                                minHeight: "60px",
                                                marginBottom: "15px",
                                            }}
                                        >
                                            {room.description || "Experience luxury and comfort in our beautifully designed room."}
                                        </p>

                                        <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                                            <span>
                                                <strong>Capacity:</strong> {room.capacity} person(s)
                                            </span>
                                            <span>
                                                <strong>Bed:</strong> {room.bedInfo || "King Bed"}
                                            </span>
                                        </div>

                                        <Button
                                            variant="outline-dark"
                                            style={{
                                                width: "100%",
                                                borderRadius: "8px",
                                                fontWeight: "500",
                                                padding: "10px 0",
                                                border: "2px solid",
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/rooms/${room.id}`);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>

            <ServiceSection />
            <TestimonialsSection/>
            
            {/* Blog Section */}
            <Row className="justify-content-center">
                <Col lg={9}>
                    <Container style={{ marginTop: "80px", marginBottom: "100px", textAlign: "center" }}>
                        {/* Heading */}
                        <p
                            style={{
                                textTransform: "uppercase",
                                color: "var(--main-color)",
                                fontWeight: "600",
                                marginBottom: "8px",
                                letterSpacing: "2px",
                            }}
                        >
                            Hotel News
                        </p>
                        <h1 style={{ fontWeight: "700", marginBottom: "50px" }}>Our Blog & Event</h1>

                        {/* Blog Grid */}
                        <Row className="justify-content-center g-4">
                            {blogs.map((blog, i) => (
                                <Col key={i} lg={4} md={6}>
                                    <Card
                                        style={{
                                            border: "none",
                                            borderRadius: "10px",
                                            overflow: "hidden",
                                            position: "relative",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {/* Image */}
                                        <Card.Img
                                            src={blog.image}
                                            alt={blog.title}
                                            style={{
                                                height: "350px",
                                                objectFit: "cover",
                                                transition: "transform 0.4s ease",
                                            }}
                                        />
                                        {/* Overlay content */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                bottom: "0",
                                                left: "0",
                                                right: "0",
                                                padding: "25px",
                                                color: "#fff",
                                                background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 70%)",
                                                textAlign: "left",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    backgroundColor: "var(--main-color)",
                                                    padding: "4px 10px",
                                                    borderRadius: "4px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    textTransform: "uppercase",
                                                    marginBottom: "8px",
                                                    display: "inline-block",
                                                }}
                                            >
                                                {blog.category}
                                            </span>
                                            <h5 style={{ fontWeight: "700", marginTop: "10px" }}>{blog.title}</h5>
                                            <div style={{ fontSize: "14px", marginTop: "10px", opacity: "0.9" }}>
                                                <FaClock style={{ marginRight: "6px" }} />
                                                {blog.date}
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </Col>
            </Row>
        </>
    );
};

export default Home;