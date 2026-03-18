import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/apiConfig";
import { 
  FaCalendarCheck, 
  FaCalendarTimes, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner,
  FaEye,
  FaHotel,
  FaUser
} from "react-icons/fa";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  // Lấy thông tin user từ localStorage
  const token = localStorage.getItem("token");
  const customerId = localStorage.getItem("customerId") || localStorage.getItem("userId");
  const isLoggedIn = !!token;

  useEffect(() => {
    // Kiểm tra đăng nhập
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Kiểm tra customerId
    if (!customerId) {
      setError("Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings for customer:", customerId);
      
      // Gọi API với customerId
      const response = await api.get(`/bookings/customer/${customerId}`);
      console.log("Bookings response:", response);
      
      // Xử lý dữ liệu
      const bookingsData = response?.data || response || [];
      setBookings(bookingsData);
      setError("");
    } catch (err) {
      console.error("Error fetching bookings:", err);
      
      // Xử lý lỗi chi tiết
      if (err.response?.status === 400) {
        setError("Mã khách hàng không hợp lệ. Vui lòng đăng nhập lại.");
      } else if (err.response?.status === 404) {
        setBookings([]); // Không có bookings, không phải lỗi
      } else {
        setError("Không thể tải danh sách đặt phòng. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Lọc bookings theo trạng thái
  const getFilteredBookings = () => {
    if (activeTab === "all") return bookings;
    return bookings.filter(b => b.status?.toLowerCase() === activeTab.toLowerCase());
  };

  // Format trạng thái
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return <Badge bg="warning"><FaSpinner className="me-1" /> Chờ thanh toán</Badge>;
      case "CONFIRMED":
        return <Badge bg="success"><FaCheckCircle className="me-1" /> Đã xác nhận</Badge>;
      case "COMPLETED":
        return <Badge bg="info"><FaCalendarCheck className="me-1" /> Hoàn tất</Badge>;
      case "CANCELLED":
        return <Badge bg="danger"><FaTimesCircle className="me-1" /> Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải danh sách đặt phòng...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">
            <FaHotel className="me-2" />
            Đặt phòng của tôi
          </h2>
          <p className="text-muted">Quản lý tất cả các đặt phòng của bạn</p>
        </Col>
      </Row>

      {/* Thông báo lỗi */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
          {error.includes("đăng nhập lại") && (
            <div className="mt-3">
              <Button variant="danger" size="sm" onClick={() => navigate("/login")}>
                Đăng nhập lại
              </Button>
            </div>
          )}
        </Alert>
      )}

      {/* Tabs lọc */}
      <Card className="shadow-sm mb-4">
        <Card.Header>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="all" title={`Tất cả (${bookings.length})`} />
            <Tab eventKey="pending" title={`Chờ thanh toán (${bookings.filter(b => b.status === 'PENDING').length})`} />
            <Tab eventKey="confirmed" title={`Đã xác nhận (${bookings.filter(b => b.status === 'CONFIRMED').length})`} />
            <Tab eventKey="completed" title={`Hoàn tất (${bookings.filter(b => b.status === 'COMPLETED').length})`} />
            <Tab eventKey="cancelled" title={`Đã hủy (${bookings.filter(b => b.status === 'CANCELLED').length})`} />
          </Tabs>
        </Card.Header>
        <Card.Body>
          {!error && filteredBookings.length === 0 ? (
            <div className="text-center py-5">
              <FaCalendarTimes size={50} className="text-muted mb-3" />
              <h5>Không có đặt phòng nào</h5>
              <p className="text-muted">
                {activeTab === "all" 
                  ? "Bạn chưa có đặt phòng nào. Hãy đặt phòng ngay!" 
                  : `Không có đặt phòng nào ở trạng thái "${activeTab}"`}
              </p>
              <Button variant="primary" href="/rooms">
                Đặt phòng ngay
              </Button>
            </div>
          ) : !error && (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Mã đặt phòng</th>
                  <th>Khách sạn</th>
                  <th>Ngày nhận</th>
                  <th>Ngày trả</th>
                  <th>Số phòng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr key={booking.id}>
                    <td><strong>{index + 1}</strong></td>
                    <td>
                      <Badge bg="outline-secondary" className="fw-normal">
                        {booking.reservationCode}
                      </Badge>
                    </td>
                    <td>Khách sạn {booking.hotelId}</td>
                    <td>{formatDate(booking.expectedCheckInDate)}</td>
                    <td>{formatDate(booking.expectedCheckOutDate)}</td>
                    <td className="text-center">
                      <Badge bg="info">{booking.roomCount || 1}</Badge>
                    </td>
                    <td className="fw-bold text-primary">
                      {booking.totalAmount?.toLocaleString()} VNĐ
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/booking-detail/${booking.id}`)}
                      >
                        <FaEye className="me-1" /> Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyBookingsPage;