import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/apiConfig";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roomAllocations, setRoomAllocations] = useState([]); // Lưu phân bổ phòng

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

  // Tính toán phân bổ phòng dựa trên số khách
  useEffect(() => {
    if (!room) return;
    
    const adult = Number(form.adultCount) || 0;
    const child = Number(form.childCount) || 0;
    const capacity = room.capacity || 1;
    
    // Tính tổng trọng số khách (người lớn = 1, trẻ em = 0.5)
    const totalGuestWeight = adult + (child * 0.5);
    
    // Tính số phòng cần thiết
    const roomsNeeded = Math.ceil(totalGuestWeight / capacity);
    
    // Phân bổ khách vào các phòng
    const allocations = [];
    let remainingAdults = adult;
    let remainingChildren = child;
    
    for (let i = 0; i < roomsNeeded; i++) {
      // Tính sức chứa còn lại của phòng này
      let roomCapacity = capacity;
      let adultsInRoom = 0;
      let childrenInRoom = 0;
      
      // Ưu tiên phân bổ người lớn trước
      while (roomCapacity >= 1 && remainingAdults > 0) {
        adultsInRoom++;
        remainingAdults--;
        roomCapacity -= 1;
      }
      
      // Sau đó phân bổ trẻ em (mỗi trẻ em chiếm 0.5)
      while (roomCapacity >= 0.5 && remainingChildren > 0) {
        childrenInRoom++;
        remainingChildren--;
        roomCapacity -= 0.5;
      }
      
      allocations.push({
        roomNumber: i + 1,
        adultCount: adultsInRoom,
        childCount: childrenInRoom,
        totalWeight: adultsInRoom + (childrenInRoom * 0.5)
      });
    }
    
    setRoomAllocations(allocations);
  }, [form.adultCount, form.childCount, room]);

  // Validate form
  const validateForm = () => {
    if (form.adultCount < 1) {
      setError("Phải có ít nhất 1 người lớn");
      return false;
    }
    
    if (!form.checkInDate || !form.checkOutDate) {
      setError("Vui lòng chọn ngày nhận và trả phòng");
      return false;
    }
    
    const checkIn = new Date(form.checkInDate);
    const checkOut = new Date(form.checkOutDate);
    
    if (checkOut <= checkIn) {
      setError("Ngày trả phòng phải sau ngày nhận phòng");
      return false;
    }
    
    return true;
  };

  const generateDocNumber = () => {
    return "DOC-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error khi user thay đổi input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
  
    try {
      // Lưu thông tin vào localStorage
      localStorage.setItem("fullName", form.guestName);
      localStorage.setItem("email", form.email);
      localStorage.setItem("phone", form.phone);
  
      // Tạo cấu trúc request
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
        rooms: roomAllocations.map(alloc => ({
          adultCount: alloc.adultCount,
          childCount: alloc.childCount
        }))
      };
  
      console.log("Request body:", JSON.stringify(body, null, 2));
      console.log(`Cần ${roomAllocations.length} phòng cho ${form.adultCount} người lớn và ${form.childCount} trẻ em`);
  
      // Gọi API
      const response = await api.post("/bookings", body);
      
      // Debug: Log toàn bộ response
      console.log("Raw response:", response);
      
      // Lấy data an toàn
      const responseData = response?.data || response;
      console.log("Response data:", responseData);
  
      // Kiểm tra response có phải là object không
      if (typeof responseData !== 'object' || responseData === null) {
        console.error("Invalid response format:", responseData);
        throw new Error("Server trả về dữ liệu không hợp lệ");
      }
  
      const reservationId = responseData?.reservationId;
      const reservationCode = responseData?.reservationCode;
  
      console.log("Extracted - reservationId:", reservationId, "reservationCode:", reservationCode);
  
      if (!reservationId) {
        // Log chi tiết để debug
        console.error("Missing reservationId. Available fields:", Object.keys(responseData));
        console.error("Full response data:", JSON.stringify(responseData, null, 2));
        throw new Error("Không lấy được reservationId từ server. Server trả về: " + JSON.stringify(responseData));
      }
  
      // Tính số đêm và tiền cọc
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
      
      const deposit = room.basePrice * nights * 23000 * 0.2;
  
      setSuccess(
        <div>
          <p className="fw-bold text-success">{responseData.message || "Đặt phòng thành công!"}</p>
          <p>Mã đặt phòng: <strong>{reservationCode}</strong></p>
          <p>
            {responseData.isLoggedIn 
              ? `Khách hàng: ${responseData.customerName || form.guestName}` 
              : "Khách vãng lai"}
          </p>
          <p>
            Số phòng: <strong>{responseData.requiredRooms || roomAllocations.length}</strong> 
            (Người lớn: {responseData.totalAdults || form.adultCount}, 
             Trẻ em: {responseData.totalChildren || form.childCount})
          </p>
          <p>
            <strong>Phân bổ phòng:</strong><br/>
            {roomAllocations.map((alloc, idx) => (
              <span key={idx}>
                Phòng {idx + 1}: {alloc.adultCount} người lớn, {alloc.childCount} trẻ em<br/>
              </span>
            ))}
          </p>
          <p>
            Tiền cọc (20%): <strong>{deposit.toLocaleString()} VNĐ</strong>
          </p>
          <p>Đang chuyển sang VNPay...</p>
        </div>
      );
  
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      // Gọi VNPay
      const paymentResp = await api.post("/payment/create-vnpay", {
        reservationId,
      });
      
      const vnpUrl = paymentResp?.data?.vnpayUrl || paymentResp?.vnpayUrl;
  
      if (!vnpUrl) {
        throw new Error("Không tạo được VNPay URL.");
      }
  
      window.location.assign(vnpUrl);
  
    } catch (err) {
      console.error("Booking error:", err);
      
      // Xử lý lỗi chi tiết
      let errorMessage = "Lỗi không xác định";
      
      if (err.response) {
        // Lỗi từ server có response
        console.error("Error response:", err.response);
        errorMessage = err.response.data?.message || err.response.data || err.message;
      } else if (err.request) {
        // Lỗi không nhận được response
        errorMessage = "Không thể kết nối đến server";
      } else {
        // Lỗi khác
        errorMessage = err.message;
      }
      
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
          <p><strong>Sức chứa:</strong> {room.capacity} người lớn (trẻ em tính 0.5)</p>
          <p><strong>Giường:</strong> {room.bedInfo}</p>

          {roomAllocations.length > 1 && (
            <Alert variant="info">
              <Alert.Heading>Cần {roomAllocations.length} phòng</Alert.Heading>
              <p>
                Với {form.adultCount} người lớn và {form.childCount} trẻ em,
                hệ thống sẽ phân bổ như sau:
              </p>
              <ul>
                {roomAllocations.map((alloc, idx) => (
                  <li key={idx}>
                    Phòng {idx + 1}: {alloc.adultCount} người lớn, {alloc.childCount} trẻ em
                  </li>
                ))}
              </ul>
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
                      max="20"
                      name="adultCount" 
                      value={form.adultCount} 
                      onChange={handleChange} 
                    />
                    <Form.Text className="text-muted">
                      Tối thiểu 1 người lớn
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Trẻ em (0-11 tuổi)</Form.Label>
                    <Form.Control 
                      type="number" 
                      min="0" 
                      max="20"
                      name="childCount" 
                      value={form.childCount} 
                      onChange={handleChange} 
                    />
                    <Form.Text className="text-muted">
                      Mỗi trẻ em tính 0.5
                    </Form.Text>
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
                  `Đặt ${roomAllocations.length} phòng`
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