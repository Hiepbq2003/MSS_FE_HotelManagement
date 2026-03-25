import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Tabs, Tab, Form, Modal, InputGroup, Pagination } from "react-bootstrap";
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
  FaUser,
  FaSearch,
  FaPrint,
  FaDownload,
  FaMoneyBillWave,
  FaConciergeBell,
  FaBed,
  FaKey,
  FaSignOutAlt,
  FaUserCheck,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from "react-icons/fa";
import { toast } from 'react-toastify';

const BookingManagement = () => {
  const navigate = useNavigate();
  
  // State cho bookings
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State cho check-in/check-out
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [checkInReceptionistId, setCheckInReceptionistId] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // State cho chi tiết booking
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [detailRooms, setDetailRooms] = useState([]);
  const [detailGuests, setDetailGuests] = useState([]);
  const [detailServices, setDetailServices] = useState([]);
  
  // State cho current guests
  const [currentGuests, setCurrentGuests] = useState([]);
  const [showCurrentGuests, setShowCurrentGuests] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(false);

  const isReceptionist = localStorage.getItem("userRole") === "RECEPTIONIST" || 
                         localStorage.getItem("userRole") === "MANAGER";

  useEffect(() => {
    if (!isReceptionist) {
      setError("Bạn không có quyền truy cập trang này. Yêu cầu vai trò RECEPTIONIST hoặc MANAGER.");
      setLoading(false);
      return;
    }
    fetchBookings();
    fetchCurrentGuests();
  }, []);

  // Lấy danh sách bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings");
      const data = response?.data || response || [];
      setBookings(data);
      setFilteredBookings(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Không thể tải danh sách đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách khách đang ở
  const fetchCurrentGuests = async () => {
    try {
      setLoadingGuests(true);
      const response = await api.get("/bookings/checkin/current-guests");
      const data = response?.data || response || [];
      setCurrentGuests(data);
    } catch (err) {
      console.error("Error fetching current guests:", err);
    } finally {
      setLoadingGuests(false);
    }
  };

  // Lấy chi tiết booking
  const fetchBookingDetail = async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      const data = response?.data || response;
      setSelectedBookingDetail(data?.reservation || data);
      setDetailRooms(data?.rooms || []);
      setDetailGuests(data?.guests || []);
      
      // Lấy dịch vụ
      try {
        const servicesRes = await api.get(`/bookings/services/${bookingId}`);
        setDetailServices(servicesRes?.data || []);
      } catch (err) {
        setDetailServices([]);
      }
    } catch (err) {
      console.error("Error fetching booking detail:", err);
      toast.error("Không thể tải chi tiết đặt phòng");
    }
  };

  // Xử lý check-in
  const handleCheckIn = async () => {
    if (!selectedBooking || !checkInReceptionistId) {
      toast.error("Vui lòng nhập mã nhân viên");
      return;
    }

    setCheckingIn(true);
    try {
      await api.post(`/bookings/checkin/reservation/${selectedBooking.id}?receptionistId=${checkInReceptionistId}`);
      toast.success(`✅ Check-in thành công cho booking ${selectedBooking.reservationCode}`);
      setShowCheckInModal(false);
      setSelectedBooking(null);
      setCheckInReceptionistId("");
      fetchBookings();
      fetchCurrentGuests();
    } catch (err) {
      console.error("Check-in error:", err);
      toast.error(err.response?.data?.error || "Lỗi check-in");
    } finally {
      setCheckingIn(false);
    }
  };

  // Xử lý check-out
  const handleCheckOut = async () => {
    if (!selectedBooking) return;

    setCheckingOut(true);
    try {
      await api.put(`/bookings/${selectedBooking.id}/check-out`);
      toast.success(`✅ Check-out thành công cho booking ${selectedBooking.reservationCode}`);
      setShowCheckOutModal(false);
      setSelectedBooking(null);
      fetchBookings();
      fetchCurrentGuests();
    } catch (err) {
      console.error("Check-out error:", err);
      toast.error(err.response?.data?.message || "Lỗi check-out");
    } finally {
      setCheckingOut(false);
    }
  };

  // Lọc bookings theo trạng thái và tìm kiếm
  useEffect(() => {
    let filtered = bookings;
    
    if (activeTab !== "all") {
      filtered = filtered.filter(b => b.status?.toLowerCase() === activeTab.toLowerCase());
    }
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.reservationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [activeTab, searchTerm, bookings]);

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Tạo số trang hiển thị
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
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
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format ngày tháng ngắn
  const formatShortDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format tiền
  const formatPrice = (price) => {
    if (!price) return "0 VNĐ";
    return price.toLocaleString() + " VNĐ";
  };

  // Mở modal chi tiết
  const handleViewDetail = async (booking) => {
    await fetchBookingDetail(booking.id);
    setShowDetailModal(true);
  };

  // Mở modal check-in
  const handleOpenCheckIn = (booking) => {
    setSelectedBooking(booking);
    setShowCheckInModal(true);
  };

  // Mở modal check-out
  const handleOpenCheckOut = (booking) => {
    setSelectedBooking(booking);
    setShowCheckOutModal(true);
  };

  // Thống kê số lượng
  const getStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === "PENDING").length;
    const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;
    const completed = bookings.filter(b => b.status === "COMPLETED").length;
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length;
    return { total, pending, confirmed, completed, cancelled };
  };

  const stats = getStats();

  if (!isReceptionist) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          <h5>🚫 Không có quyền truy cập</h5>
          <p>{error || "Bạn không có quyền xem trang này. Yêu cầu vai trò RECEPTIONIST hoặc MANAGER."}</p>
          <Button variant="primary" onClick={() => navigate("/")}>Về trang chủ</Button>
        </Alert>
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
            Quản lý đặt phòng
          </h2>
          <p className="text-muted">Quản lý check-in, check-out và theo dõi tình trạng đặt phòng</p>
        </Col>
        <Col className="text-end">
          <Button variant="outline-info" className="me-2" onClick={() => setShowCurrentGuests(!showCurrentGuests)}>
            <FaUserCheck className="me-2" />
            Khách đang ở ({currentGuests.length})
          </Button>
          <Button variant="outline-secondary">
            <FaPrint className="me-2" /> In báo cáo
          </Button>
        </Col>
      </Row>

      {/* Thống kê */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h4 className="text-primary">{stats.total}</h4>
              <p className="mb-0 text-muted">Tổng đặt phòng</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h4 className="text-warning">{stats.pending}</h4>
              <p className="mb-0 text-muted">Chờ thanh toán</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h4 className="text-success">{stats.confirmed}</h4>
              <p className="mb-0 text-muted">Đã xác nhận</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h4 className="text-info">{stats.completed}</h4>
              <p className="mb-0 text-muted">Hoàn tất</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h4 className="text-danger">{stats.cancelled}</h4>
              <p className="mb-0 text-muted">Đã hủy</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="text-center shadow-sm bg-info text-white">
            <Card.Body>
              <h4>{currentGuests.length}</h4>
              <p className="mb-0">Khách đang ở</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Danh sách khách đang ở */}
      {showCurrentGuests && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <FaUserCheck className="me-2" />
              Khách đang lưu trú ({currentGuests.length})
            </h5>
          </Card.Header>
          <Card.Body>
            {loadingGuests ? (
              <div className="text-center p-4">
                <Spinner animation="border" />
              </div>
            ) : currentGuests.length === 0 ? (
              <Alert variant="info">Hiện không có khách nào đang lưu trú</Alert>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Khách hàng</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Check-in</th>
                    <th>Check-out dự kiến</th>
                    <th>Mã đặt phòng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGuests.map((guest, idx) => (
                    <tr key={idx}>
                      <td><Badge bg="primary">{guest.roomNumber}</Badge></td>
                      <td><strong>{guest.guestName}</strong></td>
                      <td>{guest.email}</td>
                      <td>{guest.phone}</td>
                      <td>{formatShortDate(guest.checkInDate)}</td>
                      <td>{formatShortDate(guest.expectedCheckOutDate)}</td>
                      <td>{guest.reservationCode}</td>
                      <td>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleOpenCheckOut({ id: guest.reservationId, reservationCode: guest.reservationCode })}
                        >
                          <FaSignOutAlt className="me-1" /> Check-out
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Search và filter */}
      <Card className="p-3 shadow-sm mb-4">
        <Row className="align-items-center">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm theo mã đặt phòng, tên khách, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                  Xóa
                </Button>
              )}
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="text-muted small mb-0">Hiển thị</Form.Label>
              <Form.Select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                size="sm"
              >
                <option value={5}>5 dòng</option>
                <option value={10}>10 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={5}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-0"
            >
              <Tab eventKey="all" title={`Tất cả (${filteredBookings.length})`} />
              <Tab eventKey="pending" title={`Chờ thanh toán (${stats.pending})`} />
              <Tab eventKey="confirmed" title={`Đã xác nhận (${stats.confirmed})`} />
              <Tab eventKey="completed" title={`Hoàn tất (${stats.completed})`} />
              <Tab eventKey="cancelled" title={`Đã hủy (${stats.cancelled})`} />
            </Tabs>
          </Col>
        </Row>
      </Card>

      {/* Danh sách bookings */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Danh sách đặt phòng</h5>
            <div>
              <Badge bg="primary" className="me-2">Tổng: {filteredBookings.length}</Badge>
              <Badge bg="info">Hiển thị: {currentBookings.length}</Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải danh sách...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-3">{error}</Alert>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center p-5">
              <FaCalendarTimes size={50} className="text-muted mb-3" />
              <h5>Không có đặt phòng nào</h5>
            </div>
          ) : (
            <>
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '12%' }}>Mã đặt phòng</th>
                    <th style={{ width: '15%' }}>Khách hàng</th>
                    <th style={{ width: '10%' }}>Ngày nhận</th>
                    <th style={{ width: '10%' }}>Ngày trả</th>
                    <th style={{ width: '5%' }} className="text-center">Số đêm</th>
                    <th style={{ width: '12%' }} className="text-end">Tổng tiền</th>
                    <th style={{ width: '12%' }}>Trạng thái</th>
                    <th style={{ width: '12%' }} className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking, index) => (
                    <tr key={booking.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        <Badge bg="outline-secondary" className="fw-normal">
                          {booking.reservationCode}
                        </Badge>
                      </td>
                      <td>
                        <div>
                          <strong>{booking.guestName || "N/A"}</strong>
                          <br />
                          <small className="text-muted">{booking.email}</small>
                        </div>
                      </td>
                      <td>{formatShortDate(booking.expectedCheckInDate)}</td>
                      <td>{formatShortDate(booking.expectedCheckOutDate)}</td>
                      <td className="text-center">
                        <Badge bg="info">{booking.nights || "-"}</Badge>
                      </td>
                      <td className="fw-bold text-primary text-end">
                        {formatPrice(booking.totalAmount)}
                      </td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetail(booking)}
                            title="Chi tiết"
                          >
                            <FaEye />
                          </Button>
                          {booking.status === "PENDING" && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleOpenCheckIn(booking)}
                              title="Check-in"
                            >
                              <FaKey />
                            </Button>
                          )}
                          {booking.status === "CONFIRMED" && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleOpenCheckOut(booking)}
                              title="Check-out"
                            >
                              <FaSignOutAlt />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div>
                    <small className="text-muted">
                      Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBookings.length)} của {filteredBookings.length} đặt phòng
                    </small>
                  </div>
                  
                  <Pagination className="mb-0">
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)} 
                      disabled={currentPage === 1}
                    >
                      <FaAngleDoubleLeft />
                    </Pagination.First>
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(currentPage - 1)} 
                      disabled={currentPage === 1}
                    >
                      <FaChevronLeft />
                    </Pagination.Prev>

                    {getPageNumbers().map((pageNumber, index) => (
                      <Pagination.Item
                        key={index}
                        active={pageNumber === currentPage}
                        onClick={() => typeof pageNumber === 'number' && setCurrentPage(pageNumber)}
                        disabled={pageNumber === '...'}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next 
                      onClick={() => setCurrentPage(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    >
                      <FaChevronRight />
                    </Pagination.Next>
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={currentPage === totalPages}
                    >
                      <FaAngleDoubleRight />
                    </Pagination.Last>
                  </Pagination>

                  <div className="d-flex align-items-center">
                    <span className="text-muted me-2 small">Đến trang</span>
                    <Form.Select
                      size="sm"
                      style={{ width: '70px' }}
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                    >
                      {[...Array(totalPages).keys()].map(number => (
                        <option key={number + 1} value={number + 1}>
                          {number + 1}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal Check-in */}
      <Modal show={showCheckInModal} onHide={() => setShowCheckInModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaKey className="me-2" />
            Check-in khách hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <Alert variant="info">
                <strong>Mã đặt phòng:</strong> {selectedBooking.reservationCode}<br />
                <strong>Khách hàng:</strong> {selectedBooking.guestName || "N/A"}<br />
                <strong>Ngày nhận phòng:</strong> {formatShortDate(selectedBooking.expectedCheckInDate)}
              </Alert>
              <Form.Group className="mb-3">
                <Form.Label>Mã nhân viên thực hiện</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập mã nhân viên"
                  value={checkInReceptionistId}
                  onChange={(e) => setCheckInReceptionistId(e.target.value)}
                  autoFocus
                />
                <Form.Text className="text-muted">
                  Vui lòng nhập mã nhân viên để xác nhận check-in
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckInModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="success" 
            onClick={handleCheckIn}
            disabled={checkingIn || !checkInReceptionistId}
          >
            {checkingIn ? <Spinner size="sm" /> : "Xác nhận Check-in"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Check-out */}
      <Modal show={showCheckOutModal} onHide={() => setShowCheckOutModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaSignOutAlt className="me-2" />
            Check-out khách hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <Alert variant="warning">
              <strong>Mã đặt phòng:</strong> {selectedBooking.reservationCode}<br />
              <strong>Khách hàng:</strong> {selectedBooking.guestName || "N/A"}<br />
              <p className="mt-2 mb-0 text-danger">⚠️ Xác nhận check-out sẽ hoàn tất đặt phòng và thanh toán số tiền còn lại</p>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckOutModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCheckOut}
            disabled={checkingOut}
          >
            {checkingOut ? <Spinner size="sm" /> : "Xác nhận Check-out"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Chi tiết booking - giữ nguyên */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        {/* ... nội dung modal chi tiết giữ nguyên ... */}
      </Modal>
    </Container>
  );
};

export default BookingManagement;