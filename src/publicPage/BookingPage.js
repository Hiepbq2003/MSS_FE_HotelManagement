import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/apiConfig"; // Giữ nguyên, không sửa

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [requiredRooms, setRequiredRooms] = useState(1);
  
  const [form, setForm] = useState({
    guestName: localStorage.getItem("fullName") || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
    nationality: "",
    documentType: "",
    documentNumber: "",
    checkInDate: "",
    checkOutDate: "",
    adultCount: 1,
    childCount: 0,
    notes: "",
  });

  // Kiểm tra đăng nhập
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Load thông tin phòng
  useEffect(() => {
    const loadRoom = async () => {
      try {
        // API Gateway sẽ route đến Room Service
        const data = await api.get(`/room-type/${id}`);
        setRoom(data);
      } catch (err) {
        setError("Không tải được thông tin phòng.");
        console.error("Load room error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [id]);

  // Tính số phòng cần dựa trên số khách
  useEffect(() => {
    if (!room) return;
    
    const adult = Number(form.adultCount) || 0;
    const child = Number(form.childCount) || 0;
    
    // Công thức: người lớn = 1, trẻ em = 0.5
    const totalGuestWeight = adult + (child * 0.5);
    const capacity = room.capacity || 1;
    const roomsNeeded = Math.ceil(totalGuestWeight / capacity);
    
    setRequiredRooms(roomsNeeded);
  }, [form.adultCount, form.childCount, room]);

  const generateDocNumber = () => {
    return "DOC-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Lưu thông tin vào localStorage
      localStorage.setItem("fullName", form.guestName);
      localStorage.setItem("email", form.email);
      localStorage.setItem("phone", form.phone);

      // Token đã được apiConfig tự động thêm vào header

      // Tạo cấu trúc request đúng với backend
      const body = {
        hotelId: 1,
        roomTypeId: room.id,
        expectedCheckInDate: form.checkInDate,
        expectedCheckOutDate: form.checkOutDate,
        note: form.notes,
        guest: {
          fullName: form.guestName,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality || "Vietnam",
          documentType: form.documentType || "PASSPORT",
          documentNumber: form.documentNumber || generateDocNumber()
        },
        rooms: []
      };

      // Tạo rooms array dựa trên requiredRooms
      for (let i = 0; i < requiredRooms; i++) {
        body.rooms.push({
          adultCount: parseInt(form.adultCount),
          childCount: parseInt(form.childCount)
        });
      }

      console.log("Request body:", JSON.stringify(body, null, 2));

      // Gọi API qua Gateway - apiConfig tự động thêm base URL
      const res = await api.post("/bookings", body);
      
      console.log("Full response:", res.data);

      const reservationId = res.data?.reservationId;
      const reservationCode = res.data?.reservationCode;

      if (!reservationId) {
        throw new Error("Không lấy được reservationId từ server.");
      }

      // Tính số đêm và tiền cọc
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
      
      const deposit = room.basePrice * nights * 23000 * 0.2;

      setSuccess(
        <div>
          <p className="fw-bold text-success">{res.data.message}</p>
          <p>Mã đặt phòng: <strong>{reservationCode}</strong></p>
          <p>
            {res.data.isLoggedIn 
              ? `Khách hàng: ${res.data.customerName || form.guestName}` 
              : "Khách vãng lai"}
          </p>
          <p>
            Số phòng: <strong>{res.data.requiredRooms}</strong> 
            (Người lớn: {res.data.totalAdults}, Trẻ em: {res.data.totalChildren})
          </p>
          <p>
            Tiền cọc (20%): <strong>{deposit.toLocaleString()} VNĐ</strong>
          </p>
          <p>Đang chuyển sang VNPay...</p>
        </div>
      );

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Gọi VNPay qua Gateway
      const paymentResp = await api.post("/payment/create-vnpay", {
        reservationId,
      });
      
      const vnpUrl = paymentResp?.data?.vnpayUrl;

      if (!vnpUrl) {
        throw new Error("Không tạo được VNPay URL.");
      }

      window.location.assign(vnpUrl);

    } catch (err) {
      console.error("Booking error:", err);
      
      // Xử lý lỗi từ API Gateway
      const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
      setError("Đặt phòng thất bại: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  if (!room) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Không tìm thấy loại phòng.</Alert>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: 40, paddingBottom: 40 }}>
      <Row>
        <Col md={7}>
          <h3 className="fw-bold">{room.name}</h3>
          <p style={{ color: "#666" }}>{room.description}</p>
          <p><strong>Giá:</strong> {(room.basePrice * 23000).toLocaleString()} VNĐ/đêm</p>
          <p><strong>Sức chứa:</strong> {room.capacity} người lớn</p>
          <p><strong>Giường:</strong> {room.bedInfo}</p>

          {requiredRooms > 1 && (
            <Alert variant="warning">
              <Alert.Heading>Cần {requiredRooms} phòng</Alert.Heading>
              <p>
                Với {form.adultCount} người lớn và {form.childCount} trẻ em,
                bạn cần đặt {requiredRooms} phòng.
              </p>
            </Alert>
          )}
        </Col>

        <Col md={5}>
          <div style={{ background: "#1f1f1f", padding: 25, borderRadius: 10, color: "#fff" }}>
            <h4 className="text-warning fw-bold mb-3">Thông tin đặt phòng</h4>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <h5 className="text-info fw-bold mb-3">Thông tin người đặt</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Họ tên</Form.Label>
                <Form.Control 
                  type="text" 
                  name="guestName" 
                  value={form.guestName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nhập họ tên đầy đủ"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="example@email.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control 
                  type="tel" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="0123456789"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Quốc tịch</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nationality" 
                  value={form.nationality} 
                  onChange={handleChange} 
                  placeholder="VD: Vietnam"
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Loại giấy tờ</Form.Label>
                <Form.Select 
                  name="documentType" 
                  value={form.documentType} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn loại giấy tờ</option>
                  <option value="PASSPORT">Hộ chiếu (Passport)</option>
                  <option value="ID_CARD">CMND/CCCD</option>
                  <option value="DRIVER_LICENSE">Giấy phép lái xe</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số giấy tờ</Form.Label>
                <Form.Control 
                  type="text" 
                  name="documentNumber" 
                  value={form.documentNumber} 
                  onChange={handleChange} 
                  placeholder="VD: B1234567"
                  required 
                />
              </Form.Group>

              <h5 className="text-info fw-bold mb-3 mt-4">Thông tin phòng</h5>
              
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày nhận phòng</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="checkInDate" 
                      value={form.checkInDate} 
                      onChange={handleChange} 
                      min={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày trả phòng</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="checkOutDate" 
                      value={form.checkOutDate} 
                      onChange={handleChange} 
                      min={form.checkInDate}
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Người lớn</Form.Label>
                    <Form.Control 
                      type="number" 
                      min="1" 
                      max="10"
                      name="adultCount" 
                      value={form.adultCount} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Trẻ em (0-11 tuổi)</Form.Label>
                    <Form.Control 
                      type="number" 
                      min="0" 
                      max="10"
                      name="childCount" 
                      value={form.childCount} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="notes" 
                  value={form.notes} 
                  onChange={handleChange} 
                  placeholder="Yêu cầu đặc biệt (nếu có)"
                />
              </Form.Group>

              {isLoggedIn && (
                <Alert variant="info" className="mt-3">
                  <i className="bi bi-info-circle"></i> Bạn đang đặt phòng với tài khoản: <strong>{form.email}</strong>
                </Alert>
              )}

              <Button 
                variant="warning" 
                type="submit" 
                className="w-100 fw-bold mt-3" 
                disabled={submitting}
                style={{ padding: "12px" }}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Đang xử lý...
                  </>
                ) : (
                  "Hoàn tất đặt phòng"
                )}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingPage;