import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
  Table,
  Modal,
} from "react-bootstrap";
import api from "../api/apiConfig";

const CheckInforBooking = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🎯 State cho form check-in
  const [checkInForm, setCheckInForm] = useState({
    reservationCode: "",
    documentType: "CCCD",
    documentNumber: "000000", // 🆕 Đặt giá trị mặc định
  });

  // 🎯 State cho reception info
  const [receptionInfo, setReceptionInfo] = useState({
    id: null,
    name: "",
    role: ""
  });

  // 🎯 State cho modal xác nhận
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // 🔹 Load reception info
  useEffect(() => {
    const loadReceptionInfo = () => {
      const customerId = localStorage.getItem("customerId");
      const userId = localStorage.getItem("userId");
      const fullName = localStorage.getItem("fullName");
      const userRole = localStorage.getItem("userRole");
      
      const receptionId = userId || customerId;
      
      setReceptionInfo({
        id: receptionId,
        name: fullName || "Unknown Receptionist",
        role: userRole || "Unknown"
      });

      if (!receptionId) {
        console.warn("⚠️ No reception ID found in localStorage!");
      }
    };

    loadReceptionInfo();
  }, []);

  // 🔹 Load danh sách reservations có thể check-in
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/checkIn/reservations");
      setReservations(res || []);
      setFilteredReservations(res || []);
      setError(null);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách booking:", err);
      setError("Không thể tải danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // 🔹 Tìm kiếm reservation
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredReservations(reservations);
      return;
    }

    const filtered = reservations.filter(res => 
      res.reservationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.email && res.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.phone && res.phone.includes(searchTerm))
    );
    
    setFilteredReservations(filtered);
  }, [searchTerm, reservations]);

  // 🔹 Xử lý thay đổi form
  const handleFormChange = (e) => {
    setCheckInForm({
      ...checkInForm,
      [e.target.name]: e.target.value
    });
  };

  // 🆕 Tự động điền document number khi chọn reservation từ bảng
  const handleSelectReservation = (reservation) => {
    setCheckInForm({
      reservationCode: reservation.reservationCode,
      documentType: "CCCD",
      documentNumber: "000000" // 🆕 Luôn đặt giá trị mặc định
    });
    setSelectedReservation(reservation);
    setError(null);
  };

  // 🔹 Xác thực mã booking và document
  const handleVerifyBooking = async () => {
    try {
      if (!checkInForm.reservationCode.trim()) {
        setError("Vui lòng nhập mã booking");
        return;
      }

      // 🆕 Không cần kiểm tra document number nữa vì đã có giá trị mặc định
      if (!checkInForm.documentNumber.trim()) {
        setCheckInForm(prev => ({ ...prev, documentNumber: "000000" }));
      }

      setLoading(true);
      
      // 🎯 Tìm reservation theo mã
      const reservation = reservations.find(
        res => res.reservationCode === checkInForm.reservationCode
      );

      if (!reservation) {
        setError("❌ Mã booking không tồn tại");
        return;
      }

      setSelectedReservation(reservation);
      setShowConfirmModal(true);
      setError(null);
      
    } catch (err) {
      console.error("❌ Lỗi xác thực booking:", err);
      setError("Lỗi xác thực thông tin booking");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Xử lý check-in
const handleCheckIn = async () => {
    try {
      if (!selectedReservation) {
        setError("❌ Vui lòng chọn reservation trước khi check-in");
        return;
      }
  
      // 🎯 Kiểm tra reception ID
      if (!receptionInfo.id) {
        setError("❌ Không tìm thấy thông tin receptionist. Vui lòng đăng nhập lại.");
        return;
      }
  
      setLoading(true);
      setError(null);
      
      const reservationId = selectedReservation.id;
      const receptionistId = parseInt(receptionInfo.id);
  
      console.log("📤 Gửi request check-in:", {
        reservationId: reservationId,
        receptionistId: receptionistId,
        documentType: checkInForm.documentType,
        documentNumber: checkInForm.documentNumber
      });
  
      // 🎯 VALIDATION trước khi gọi API
      if (!reservationId || reservationId <= 0) {
        throw new Error("Reservation ID không hợp lệ: " + reservationId);
      }
  
      if (!receptionistId || receptionistId <= 0) {
        throw new Error("Receptionist ID không hợp lệ: " + receptionistId);
      }
  
      // 🎯 Gọi API check-in với error handling chi tiết
      try {
        const response = await api.post(
          `/checkIn/reservation/${reservationId}?receptionistId=${receptionistId}`
        );
  
        console.log("✅ Check-in response:", response);
  
        setSuccess(`✅ Check-in thành công cho ${selectedReservation.guestName}`);
        setShowConfirmModal(false);
        setCheckInForm({
          reservationCode: "",
          documentType: "CCCD",
          documentNumber: "000000",
        });
        setSelectedReservation(null);
        
        // Refresh danh sách
        fetchReservations();
        
      } catch (apiError) {
        console.error("❌ API Error chi tiết:", {
          name: apiError.name,
          message: apiError.message,
          stack: apiError.stack,
          response: apiError.response,
          config: apiError.config
        });
  
        // 🆕 Phân loại lỗi
        if (apiError.response) {
          // Backend trả về lỗi
          const errorData = apiError.response.data;
          const errorMsg = errorData?.error || errorData?.message || `HTTP ${apiError.response.status}`;
          setError(`❌ Lỗi từ server: ${errorMsg}`);
        } else if (apiError.request) {
          // Request được gửi nhưng không nhận được response
          setError("❌ Không nhận được phản hồi từ server. Kiểm tra kết nối mạng.");
        } else {
          // Lỗi khi thiết lập request
          setError(`❌ Lỗi thiết lập request: ${apiError.message}`);
        }
      }
      
    } catch (err) {
      console.error("❌ Lỗi tổng thể check-in:", err);
      setError(`❌ Lỗi hệ thống: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      {/* 🎯 Header với reception info */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Reception - Check-in từ Booking Online</h3>
        <div className="text-end">
          <small className="text-muted">
            Receptionist: <strong>{receptionInfo.name}</strong> 
            {receptionInfo.id && ` (ID: ${receptionInfo.id})`}
          </small>
        </div>
      </div>

      {/* 🎯 Form xác thực booking */}
      <Card className="p-4 shadow-sm mb-4">
        <h5 className="text-primary mb-3">🔐 Xác thực Booking</h5>
        
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Mã Booking *</Form.Label>
              <Form.Control
                type="text"
                name="reservationCode"
                value={checkInForm.reservationCode}
                onChange={handleFormChange}
                placeholder="Nhập mã booking (VD: RES-123456)"
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Loại giấy tờ *</Form.Label>
              <Form.Select
                name="documentType"
                value={checkInForm.documentType}
                onChange={handleFormChange}
              >
                <option value="CCCD">CCCD</option>
                <option value="Passport">Passport</option>
                <option value="DriverLicense">Bằng lái xe</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4} className="d-flex align-items-end mb-3">
            <Button
              onClick={handleVerifyBooking}
              disabled={!checkInForm.reservationCode || !checkInForm.documentNumber || !receptionInfo.id}
              variant={!receptionInfo.id ? "warning" : "primary"}
              className="w-100"
            >
              {!receptionInfo.id ? "⚠️ Chưa ĐN" : "Xác thực"}
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      </Card>

      {/* 🎯 Danh sách booking có thể check-in */}
      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-primary">📋 Danh sách Booking chờ Check-in</h5>
          
          <Form.Group className="w-25">
            <Form.Control
              type="text"
              placeholder="Tìm theo mã, tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </div>

        {loading && <div className="text-center"><Spinner animation="border" /></div>}

        {!loading && filteredReservations.length === 0 && (
          <Alert variant="info">
            {searchTerm ? "Không tìm thấy booking phù hợp" : "Không có booking nào chờ check-in"}
          </Alert>
        )}

        {!loading && filteredReservations.length > 0 && (
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Mã Booking</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Ngày đến</th>
                <th>Ngày đi</th>
                <th>Trạng thái</th>
                <th>🆕 Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res, index) => (
                <tr 
                  key={res.id} 
                  className={selectedReservation?.id === res.id ? "table-warning" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <td>{index + 1}</td>
                  <td>
                    <strong>{res.reservationCode}</strong>
                  </td>
                  <td>{res.guestName}</td>
                  <td>{res.email || "N/A"}</td>
                  <td>{res.phone || "N/A"}</td>
                  <td>{new Date(res.arrivalDate).toLocaleString()}</td>
                  <td>{new Date(res.departureDate).toLocaleString()}</td>
                  <td>
                    <span className="badge bg-warning">Chờ check-in</span>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleSelectReservation(res)}
                    >
                      Chọn
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* 🎯 Modal xác nhận check-in */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>✅ Xác nhận Check-in</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <div>
              <p>Bạn có chắc muốn check-in cho booking sau?</p>
              
              <div className="border p-3 rounded bg-light">
                <p><strong>Mã Booking:</strong> {selectedReservation.reservationCode}</p>
                <p><strong>Khách hàng:</strong> {selectedReservation.guestName}</p>
                <p><strong>Email:</strong> {selectedReservation.email || "N/A"}</p>
                <p><strong>SĐT:</strong> {selectedReservation.phone || "N/A"}</p>
                <p><strong>Ngày đến:</strong> {new Date(selectedReservation.arrivalDate).toLocaleString()}</p>
                <p><strong>Ngày đi:</strong> {new Date(selectedReservation.departureDate).toLocaleString()}</p>
                <p><strong>Loại giấy tờ:</strong> {checkInForm.documentType}</p>
                <p><strong>Số giấy tờ:</strong> {checkInForm.documentNumber}</p>
                <p><strong>Receptionist:</strong> {receptionInfo.name} (ID: {receptionInfo.id})</p>
              </div>

              <Alert variant="info" className="mt-3">
                <small>
                  📝 <strong>Lưu ý:</strong> Sau khi check-in, phòng sẽ được đánh dấu là "đã nhận phòng" 
                  và khách có thể sử dụng phòng.
                </small>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "✅ Xác nhận Check-in"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CheckInforBooking;