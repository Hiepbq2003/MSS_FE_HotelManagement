import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import BookingServices from '../components/BookingServices';
import BookingServicesList from '../components/BookingServicesList';
import { FaConciergeBell } from 'react-icons/fa';
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
  const [roomAllocations, setRoomAllocations] = useState([]);
  const [showServices, setShowServices] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [showServicesList, setShowServicesList] = useState(false);
  const [servicesUpdated, setServicesUpdated] = useState(false);
  const [deposit, setDeposit] = useState(0);
  const [nights, setNights] = useState(0);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

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

  // Tính toán phân bổ phòng và tiền cọc
  useEffect(() => {
    if (!room) return;
    
    const adult = Number(form.adultCount) || 0;
    const child = Number(form.childCount) || 0;
    const capacity = room.capacity || 1;
    
    const totalGuestWeight = adult + (child * 0.5);
    const roomsNeeded = Math.ceil(totalGuestWeight / capacity);
    
    const allocations = [];
    let remainingAdults = adult;
    let remainingChildren = child;
    
    for (let i = 0; i < roomsNeeded; i++) {
      let roomCapacity = capacity;
      let adultsInRoom = 0;
      let childrenInRoom = 0;
      
      while (roomCapacity >= 1 && remainingAdults > 0) {
        adultsInRoom++;
        remainingAdults--;
        roomCapacity -= 1;
      }
      
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

    // Tính tiền cọc khi có checkInDate và checkOutDate
    if (form.checkInDate && form.checkOutDate) {
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      const nightsCount = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
      setNights(nightsCount);
      
      // Tính tổng tiền và tiền cọc 20%
      const totalAmount = room.basePrice * nightsCount * 23000 * roomsNeeded;
      const depositAmount = totalAmount * 0.2;
      setDeposit(depositAmount);
    }
  }, [form.adultCount, form.childCount, form.checkInDate, form.checkOutDate, room]);

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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      localStorage.setItem("fullName", form.guestName);
      localStorage.setItem("email", form.email);
      localStorage.setItem("phone", form.phone);
  
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
  
      console.log("📤 STEP 1: Booking Request Body:", JSON.stringify(body, null, 2));
      console.log(`📤 STEP 1: Cần ${roomAllocations.length} phòng cho ${form.adultCount} người lớn và ${form.childCount} trẻ em`);
  
      // 1. Đặt phòng
      console.log("📤 STEP 1: Sending booking request to /bookings...");
      const response = await api.post("/bookings", body);
      
      console.log("📥 STEP 1: Raw booking response:", response);
      
      const responseData = response?.data || response;
      console.log("📥 STEP 1: Booking response data:", responseData);
  
      if (typeof responseData !== 'object' || responseData === null) {
        console.error("❌ STEP 1: Invalid response format:", responseData);
        throw new Error("Server trả về dữ liệu không hợp lệ");
      }
  
      const reservationId = responseData?.reservationId;
      const reservationCode = responseData?.reservationCode;
  
      console.log("📥 STEP 1: Extracted - reservationId:", reservationId, "reservationCode:", reservationCode);
  
      if (!reservationId) {
        console.error("❌ STEP 1: Missing reservationId. Available fields:", Object.keys(responseData));
        console.error("❌ STEP 1: Full response data:", JSON.stringify(responseData, null, 2));
        throw new Error("Không lấy được reservationId từ server");
      }
  
      setCurrentReservationId(reservationId);
  
      // 2. Tạo thanh toán VNPay với tiền cọc 20%
      console.log("📤 STEP 2: Sending payment request to /payments/create-vnpay with payload:", { reservationId });
      console.log("📤 STEP 2: Full URL being called:", `${api.defaults?.baseURL || 'http://localhost:8000/api'}/payments/create-vnpay`);
      
      let paymentResponse;
      try {
        paymentResponse = await api.post("/payments/create-vnpay", {
          reservationId: reservationId
        });
        console.log("📥 STEP 2: Raw payment response:", paymentResponse);
      } catch (paymentError) {
        console.error("❌ STEP 2: Payment API call failed:", paymentError);
        console.error("❌ STEP 2: Payment error config:", paymentError.config);
        console.error("❌ STEP 2: Payment error response:", paymentError.response);
        console.error("❌ STEP 2: Payment error request:", paymentError.request);
        throw paymentError;
      }
      
      console.log("📥 STEP 2: Payment response status:", paymentResponse?.status);
      console.log("📥 STEP 2: Payment response headers:", paymentResponse?.headers);
      console.log("📥 STEP 2: Payment response data:", paymentResponse?.data);
      
      // Kiểm tra cấu trúc response
      const paymentData = paymentResponse?.data || paymentResponse;
      console.log("📥 STEP 2: Payment data structure:", {
        hasData: !!paymentResponse?.data,
        dataKeys: paymentResponse?.data ? Object.keys(paymentResponse.data) : [],
        responseKeys: paymentResponse ? Object.keys(paymentResponse) : [],
        paymentDataKeys: paymentData ? Object.keys(paymentData) : []
      });
      
      const vnpUrl = paymentData?.vnpayUrl || paymentResponse?.vnpayUrl;
      console.log("🔗 STEP 2: Extracted VNPay URL:", vnpUrl);
      
      if (!vnpUrl) {
        console.error("❌ STEP 2: No VNPay URL found in response");
        console.error("❌ STEP 2: Full payment response:", JSON.stringify(paymentResponse, null, 2));
        throw new Error("Không tạo được VNPay URL");
      }
  
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
            Tiền cọc (20%): <strong className="text-warning">{deposit.toLocaleString()} VNĐ</strong>
          </p>
          <p>Đang chuyển sang cổng thanh toán VNPay...</p>
        </div>
      );
  
      // Chờ 1 giây để hiển thị thông báo
      console.log("🚀 STEP 3: Waiting 1 second before redirect...");
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Chuyển hướng đến VNPay
      console.log("🚀 STEP 3: Redirecting to VNPay URL:", vnpUrl);
      window.location.href = vnpUrl;
  
    } catch (err) {
      console.error("❌ FINAL: Booking error:", err);
      
      // Log chi tiết lỗi
      if (err.response) {
        console.error("❌ FINAL: Error response status:", err.response.status);
        console.error("❌ FINAL: Error response data:", err.response.data);
        console.error("❌ FINAL: Error response headers:", err.response.headers);
      } else if (err.request) {
        console.error("❌ FINAL: No response received. Request:", err.request);
      } else {
        console.error("❌ FINAL: Error message:", err.message);
      }
      
      let errorMessage = "Lỗi không xác định";
      
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || err.message;
      } else if (err.request) {
        errorMessage = "Không thể kết nối đến server";
      } else {
        errorMessage = err.message;
      }
      
      setError("Đặt phòng thất bại: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleServicesAdded = (services) => {
    console.log('Services added:', services);
    setServicesUpdated(prev => !prev);
    setShowServicesList(true);
  };

  const handleViewServices = () => {
    setShowServicesList(!showServicesList);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
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
          
          {nights > 0 && (
            <Alert variant="success">
              <strong>Tổng tiền phòng:</strong> {(room.basePrice * nights * 23000 * roomAllocations.length).toLocaleString()} VNĐ<br/>
              <strong>Tiền cọc 20%:</strong> <span className="text-danger fw-bold">{deposit.toLocaleString()} VNĐ</span>
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

              <div className="mt-3 p-3 bg-dark rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tổng tiền phòng:</span>
                  <span className="fw-bold">{(room.basePrice * nights * 23000 * roomAllocations.length).toLocaleString()} VNĐ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tiền cọc (20%):</span>
                  <span className="fw-bold text-warning">{deposit.toLocaleString()} VNĐ</span>
                </div>
              </div>

              <Button 
                variant="warning" 
                type="submit" 
                className="w-100 fw-bold mt-3" 
                disabled={submitting || !deposit}
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
                  `Đặt cọc ${deposit.toLocaleString()} VNĐ`
                )}
              </Button>

              {currentReservationId && (
                <Button
                  variant="info"
                  className="w-100 fw-bold mt-3"
                  onClick={handleViewServices}
                >
                  <FaConciergeBell className="me-2" />
                  {showServicesList ? 'Ẩn dịch vụ đã đặt' : 'Xem dịch vụ đã đặt'}
                </Button>
              )}

              {showServicesList && currentReservationId && (
                <div className="mt-3">
                  <BookingServicesList
                    reservationId={currentReservationId}
                    onUpdate={() => setServicesUpdated(prev => !prev)}
                  />
                </div>
              )}
            </Form>
          </div>
        </Col>
      </Row>

      <BookingServices
        show={showServices}
        handleClose={() => setShowServices(false)}
        reservationId={currentReservationId}
        hotelId={room?.hotelId || 1}
        onServicesAdded={handleServicesAdded}
      />
    </Container>
  );
};

export default BookingPage;