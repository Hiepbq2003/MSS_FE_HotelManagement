import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, ListGroup } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/apiConfig";
import { 
  FaArrowLeft, 
  FaHotel, 
  FaUser, 
  FaCalendarCheck, 
  FaCalendarTimes, 
  FaMoneyBillWave,
  FaConciergeBell,
  FaPrint,
  FaDownload
} from "react-icons/fa";

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin booking
      const bookingRes = await api.get(`/bookings/${id}`);
      console.log("Booking detail:", bookingRes);
      
      const bookingData = bookingRes?.data || bookingRes;
      setBooking(bookingData?.reservation || bookingData);
      setRooms(bookingData?.rooms || []);
      setGuests(bookingData?.guests || []);
      
      // Lấy dịch vụ đã đặt (nếu có)
      try {
        const servicesRes = await api.get(`/bookings/services/${id}`);
        setServices(servicesRes?.data || []);
      } catch (err) {
        console.log("No services found for this booking");
      }
      
    } catch (err) {
      console.error("Error fetching booking detail:", err);
      setError("Không thể tải thông tin đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format trạng thái
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return <Badge bg="warning">Chờ thanh toán</Badge>;
      case "CONFIRMED":
        return <Badge bg="success">Đã xác nhận</Badge>;
      case "COMPLETED":
        return <Badge bg="info">Hoàn tất</Badge>;
      case "CANCELLED":
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải thông tin đặt phòng...</p>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error || "Không tìm thấy thông tin đặt phòng"}</p>
          <Button variant="outline-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Quay lại
          </Button>
        </Alert>
      </Container>
    );
  }

  // Tính toán thời gian lưu trú
  const checkIn = new Date(booking.expectedCheckInDate);
  const checkOut = new Date(booking.expectedCheckOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;

  // Tính tổng tiền dịch vụ
  const totalServicePrice = services.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const totalRoomPrice = booking.totalAmount * 23000; // USD to VND
  const grandTotal = totalRoomPrice + totalServicePrice;

  return (
    <Container className="mt-4 mb-5">
      {/* Header với nút quay lại */}
      <Row className="mb-4">
        <Col>
          <Button 
            variant="link" 
            className="text-decoration-none mb-3 p-0"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="me-2" /> Quay lại danh sách
          </Button>
          <h2 className="text-primary">
            <FaHotel className="me-2" />
            Chi tiết đặt phòng
          </h2>
          <p className="text-muted">Mã đặt phòng: <strong>{booking.reservationCode}</strong></p>
        </Col>
        <Col className="text-end">
          <Button variant="outline-secondary" className="me-2">
            <FaPrint className="me-2" /> In
          </Button>
          <Button variant="outline-primary">
            <FaDownload className="me-2" /> Tải PDF
          </Button>
        </Col>
      </Row>

      {/* Thông tin cơ bản */}
      <Row>
        <Col md={8}>
          {/* Thông tin đặt phòng */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaCalendarCheck className="me-2 text-primary" />
                Thông tin đặt phòng
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span className="text-muted">Mã đặt phòng:</span>
                      <strong>{booking.reservationCode}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span className="text-muted">Trạng thái:</span>
                      {getStatusBadge(booking.status)}
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span className="text-muted">Ngày đặt:</span>
                      <strong>{formatDate(booking.createdDate)}</strong>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span className="text-muted">Nhận phòng:</span>
                      <strong>{formatDate(booking.expectedCheckInDate)}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span className="text-muted">Trả phòng:</span>
                      <strong>{formatDate(booking.expectedCheckOutDate)}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span className="text-muted">Số đêm:</span>
                      <strong>{nights} đêm</strong>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
              {booking.note && (
                <Alert variant="info" className="mt-3 mb-0">
                  <strong>Ghi chú:</strong> {booking.note}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Thông tin khách */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaUser className="me-2 text-primary" />
                Thông tin khách hàng
              </h5>
            </Card.Header>
            <Card.Body>
              {guests.length > 0 ? (
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>SĐT</th>
                      <th>Quốc tịch</th>
                      <th>Giấy tờ</th>
                      <th>Số giấy tờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((guest, idx) => (
                      <tr key={idx}>
                        <td><strong>{guest.fullName}</strong></td>
                        <td>{guest.email || "N/A"}</td>
                        <td>{guest.phone || "N/A"}</td>
                        <td>{guest.nationality || "N/A"}</td>
                        <td>{guest.documentType || "N/A"}</td>
                        <td>{guest.documentNumber || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center py-3">Không có thông tin khách hàng</p>
              )}
            </Card.Body>
          </Card>

          {/* Thông tin phòng */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaHotel className="me-2 text-primary" />
                Thông tin phòng
              </h5>
            </Card.Header>
            <Card.Body>
              {rooms.length > 0 ? (
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Phòng</th>
                      <th>Loại phòng</th>
                      <th>Người lớn</th>
                      <th>Trẻ em</th>
                      <th>Giá/đêm</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room, idx) => (
                      <tr key={idx}>
                        <td><Badge bg="outline-primary">{room.roomNumber || `P${room.roomId}`}</Badge></td>
                        <td>Loại {room.roomTypeId}</td>
                        <td className="text-center">{room.adultCount || 0}</td>
                        <td className="text-center">{room.childCount || 0}</td>
                        <td className="text-end">{(room.nightlyPrice * 23000).toLocaleString()} VNĐ</td>
                        <td>{getStatusBadge(room.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center py-3">Không có thông tin phòng</p>
              )}
            </Card.Body>
          </Card>

          {/* Dịch vụ đã đặt */}
          {services.length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FaConciergeBell className="me-2 text-primary" />
                  Dịch vụ đã đặt
                </h5>
              </Card.Header>
              <Card.Body>
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Dịch vụ</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, idx) => (
                      <tr key={idx}>
                        <td>{service.serviceName || `Dịch vụ ${service.serviceId}`}</td>
                        <td className="text-center">{service.quantity}</td>
                        <td className="text-end">{(service.unitPrice || 0).toLocaleString()} VNĐ</td>
                        <td className="text-end fw-bold">{(service.totalPrice || 0).toLocaleString()} VNĐ</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Sidebar - Tổng kết thanh toán */}
        <Col md={4}>
          <Card className="shadow-sm mb-4 sticky-top" style={{ top: "20px" }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaMoneyBillWave className="me-2" />
                Tổng kết thanh toán
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Tiền phòng ({nights} đêm):</span>
                  <span className="fw-bold">{totalRoomPrice.toLocaleString()} VNĐ</span>
                </ListGroup.Item>
                
                {services.length > 0 && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">Dịch vụ:</span>
                    <span className="fw-bold">{totalServicePrice.toLocaleString()} VNĐ</span>
                  </ListGroup.Item>
                )}
                
                <ListGroup.Item className="d-flex justify-content-between border-top">
                  <span className="h6">Tổng cộng:</span>
                  <span className="h6 text-primary">{grandTotal.toLocaleString()} VNĐ</span>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Đã thanh toán:</span>
                  <span className="fw-bold text-success">{(grandTotal * 0.2).toLocaleString()} VNĐ</span>
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">Còn lại:</span>
                  <span className="fw-bold text-danger">{(grandTotal * 0.8).toLocaleString()} VNĐ</span>
                </ListGroup.Item>
              </ListGroup>

              <hr />

              <div className="text-center">
                <p className="text-muted small mb-3">
                  {booking.status === "PENDING" && "Vui lòng thanh toán để xác nhận đặt phòng"}
                  {booking.status === "CONFIRMED" && "Đặt phòng đã được xác nhận. Cảm ơn bạn!"}
                  {booking.status === "COMPLETED" && "Cảm ơn bạn đã sử dụng dịch vụ. Hẹn gặp lại!"}
                </p>
                
                {booking.status === "PENDING" && (
                  <Button variant="warning" className="w-100" size="lg">
                    Thanh toán ngay
                  </Button>
                )}
                
                {booking.status === "CONFIRMED" && (
                  <Button variant="info" className="w-100">
                    Liên hệ khách sạn
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingDetailPage;