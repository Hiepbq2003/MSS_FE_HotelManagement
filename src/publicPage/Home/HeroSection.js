import React, { useEffect, useState } from "react";
import { Carousel, Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaRegCalendarAlt } from "react-icons/fa";
import api from "../../api/apiConfig";

const HeroSection = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 🔹 Fetch danh sách loại phòng
  useEffect(() => {
    api
      .get("/room-type/hotel/1")
      .then((res) => setRoomTypes(res || []))
      .catch((err) => console.error("❌ Lỗi khi tải room types:", err));
  }, []);

  // 🔹 Form dữ liệu
  const [form, setForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    adultCount: 2,
    roomCount: 1,
    roomType: "",
  });

  // 🔹 Xử lý thay đổi input
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 🔹 Kiểm tra phòng trống
  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...form,
        checkInDate: new Date(form.checkInDate).toISOString(),
        checkOutDate: new Date(form.checkOutDate).toISOString(),
      };

      console.log("📤 Gửi yêu cầu kiểm tra phòng:", payload);
      const res = await api.post("/booking/check-availability", payload);
      console.log("✅ Phản hồi:", res);

      setMessage(`✅ ${res.availableRooms || 0} phòng trống được tìm thấy.`);
    } catch (err) {
      console.error("❌ Lỗi khi kiểm tra phòng:", err);
      setMessage("❌ Không tìm thấy phòng trống hoặc lỗi server.");
    } finally {
      setLoading(false);
    }
  };

  const images = [
    "https://peridotgrandhotel.com/wp-content/uploads/2022/09/2.-Lobby-Area-2-2000.jpg",
    "https://peridotgrandhotel.com/wp-content/uploads/2025/05/22th416454.jpg",
    "https://peridotgrandhotel.com/wp-content/uploads/2022/09/Ignite-Sky-Bar-Birdeye.jpg",
  ];

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* Carousel Background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <Carousel fade controls={false} indicators={false} interval={5000}>
          {images.map((img, i) => (
            <Carousel.Item key={i}>
              <div
                style={{
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "100vh",
                  width: "100%",
                  filter: "brightness(60%)",
                }}
              ></div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Overlay content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          color: "white",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="align-items-center" style={{ marginRight: "70px", marginLeft: "70px" }}>
            {/* Left: Text */}
            <Col lg={6} md={12} className="text-lg-start text-center mb-4 mb-lg-0">
              <h1
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "600",
                  lineHeight: "1.2",
                }}
              >
                Mr.STELLAR A Luxury Hotel
              </h1>
              <p
                style={{
                  maxWidth: "450px",
                  color: "#eee",
                  margin: "20px 0",
                  fontSize: "1.05rem",
                }}
              >
                Experience ultimate comfort and elegance — check our room availability below.
              </p>
              <Button
                variant="outline-light"
                style={{
                  borderRadius: "0",
                  letterSpacing: "1px",
                  fontWeight: "500",
                }}
              >
                DISCOVER NOW
              </Button>
            </Col>

            {/* Right: Booking Form */}
            <Col
              lg={4}
              md={10}
              className="ms-auto bg-white text-dark rounded"
              style={{
                boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                opacity: 0.97,
                padding: "55px",
              }}
            >
              <h3 className="mb-4 text-center fw-semibold">Booking Your Hotel</h3>

              <Form onSubmit={handleCheckAvailability} className="text-secondary">
                {message && <Alert variant="info">{message}</Alert>}

                {/* Check In */}
                <Form.Group className="mb-3">
                  <Form.Label>Check In:</Form.Label>
                  <div style={{ position: "relative" }}>
                    <Form.Control
                      type="date"
                      name="checkInDate"
                      value={form.checkInDate}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: 0, paddingLeft: "35px" }}
                    />
                    <FaRegCalendarAlt
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#888",
                      }}
                    />
                  </div>
                </Form.Group>

                {/* Check Out */}
                <Form.Group className="mb-3">
                  <Form.Label>Check Out:</Form.Label>
                  <div style={{ position: "relative" }}>
                    <Form.Control
                      type="date"
                      name="checkOutDate"
                      value={form.checkOutDate}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: 0, paddingLeft: "35px" }}
                    />
                    <FaRegCalendarAlt
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#888",
                      }}
                    />
                  </div>
                </Form.Group>

                {/* Guests */}
                <Form.Group className="mb-3">
                  <Form.Label>Guests:</Form.Label>
                  <Form.Select name="adultCount" value={form.adultCount} onChange={handleChange} style={{ borderRadius: 0 }}>
                    <option value={1}>1 ADULT</option>
                    <option value={2}>2 ADULTS</option>
                    <option value={3}>3 ADULTS</option>
                    <option value={4}>4 ADULTS</option>
                  </Form.Select>
                </Form.Group>

                {/* Room count */}
                <Form.Group className="mb-3">
                  <Form.Label>Rooms:</Form.Label>
                  <Form.Select name="roomCount" value={form.roomCount} onChange={handleChange} style={{ borderRadius: 0 }}>
                    <option value={1}>1 ROOM</option>
                    <option value={2}>2 ROOMS</option>
                    <option value={3}>3 ROOMS</option>
                  </Form.Select>
                </Form.Group>

                {/* Room Type */}
                <Form.Group className="mb-4">
                  <Form.Label>Room Type:</Form.Label>
                  <Form.Select name="roomType" value={form.roomType} onChange={handleChange} style={{ borderRadius: 0 }}>
                    <option value="">Select Room Type</option>
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.code}>
                        {rt.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Button */}
                <Button
                  variant="outline-dark"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                  style={{
                    borderRadius: 0,
                    fontWeight: "600",
                    padding: "10px 0",
                    letterSpacing: "1px",
                    borderColor: "#222",
                  }}
                >
                  {loading ? <Spinner size="sm" /> : "CHECK AVAILABILITY"}
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default HeroSection;
