import React, { useEffect, useState } from "react";
import { Container, Row, Col, Carousel, Button, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/apiConfig";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL placeholder mặc định
  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/800x500?text=Room+Image";

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await api.get(`/room-type/${id}`);
        setRoom(data); // data giờ chứa trường 'image'
        setError(null);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin phòng.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="m-4 text-center">
        {error}
      </Alert>
    );

  if (!room)
    return (
      <Alert variant="info" className="m-4 text-center">
        Không tìm thấy thông tin phòng.
      </Alert>
    );
    
    // Tạo mảng ảnh cho Carousel. Vì BE chỉ trả về 1 URL (image), ta sẽ hiển thị nó.
    // Nếu có trường room.images (cho nhiều ảnh), ưu tiên dùng nó. Nếu không, dùng room.image.
    const carouselItems = (room.images && room.images.length > 0)
        ? room.images.map(img => ({ url: img.url || img })) // Giả định img là object có url hoặc là string url
        : [{ url: room.image }]; // SỬ DỤNG TRƯỜNG room.image MỚI

  return (
    <Container style={{ paddingTop: "50px", paddingBottom: "50px" }}>
      <Row>
        {/* Carousel ảnh phòng */}
        <Col md={7}>
          <Carousel fade>
            {carouselItems.map((img, index) => (
              <Carousel.Item key={index}>
                <img
                  className="d-block w-100"
                  src={img.url || DEFAULT_IMAGE_URL} // Dùng URL ảnh
                  alt={`Room ${index}`}
                  style={{ height: "400px", objectFit: "cover", borderRadius: "10px" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>

          <div style={{ marginTop: "30px" }}>
            <h3 style={{ fontWeight: "bold" }}>{room.name}</h3>
            <p style={{ color: "#555", fontSize: "15px" }}>{room.description}</p>

            <h5 className="mt-3">Tiện nghi</h5>
            <ul style={{ columns: 2, listStyle: "none", paddingLeft: 0 }}>
              {room.amenities?.map((a, i) => (
                <li key={i}>✔️ {a.name || a}</li>
              )) || <li>Không có thông tin.</li>}
            </ul>

          </div>
        </Col>

        {/* Khung đặt phòng bên phải */}
        <Col md={5}>
          <div
            style={{
              background: "#2c2c2c",
              color: "#fff",
              padding: "30px",
              borderRadius: "10px",
              height: "100%",
            }}
          >
            <h5>Số lượng: {room.quantity || 1}</h5>
            <p>Diện tích: {room.size || 20} m²</p>
            <p>Giường: {room.bedInfo}</p>
            <p>Sức chứa: {room.capacity} người</p>
            <h4 style={{ color: "#f4b400", fontWeight: "bold" }}>
              Giá phòng: {room.basePrice} VNĐ/đêm
            </h4>

            <Button
              variant="warning"
              style={{
                color: "#000",
                fontWeight: "600",
                width: "100%",
                marginTop: "20px",
              }}
              onClick={() => navigate(`/booking/${room.id}`)}
            >
              Đặt phòng
            </Button>

            <div style={{ marginTop: "20px", fontSize: "14px", color: "#ccc" }}>
              <h6>Ghi chú:</h6>
              <p>- Phụ thu khách thứ 3: 150.000đ/đêm</p>
              <p>- Giờ nhận phòng: 14h00, trả phòng: 12h00</p>
              <p>- Bao gồm 10% VAT</p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RoomDetails;