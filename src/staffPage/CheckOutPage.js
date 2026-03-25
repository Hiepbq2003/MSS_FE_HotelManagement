import React, { useEffect, useState } from "react";
import api from "../api/apiConfig";
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Card,
  Badge,
  Modal,
  Form,
  InputGroup,
} from "react-bootstrap";

const CheckOutPage = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  
  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all"); // all, name, room, reservation

  // 🔹 Tải danh sách khách đang check-in
  const fetchCheckedInGuests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/checkin/current-guests");
      
      const activeCheckIns = res.filter(item => 
        item.status === "CHECKED_IN" || 
        item.status === "checked_in" ||
        item.status === "CONFIRMED" ||
        (item.status && item.status.toString().toUpperCase() === "CHECKED_IN")
      );
      
      setCheckIns(activeCheckIns);
      setFilteredCheckIns(activeCheckIns);
      setError(null);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách khách đang ở:", err);
      setError("Không thể tải danh sách khách đang ở.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckedInGuests();
  }, []);

  // 🔹 Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCheckIns(checkIns);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    let filtered = [];

    switch (searchType) {
      case "name":
        filtered = checkIns.filter(guest => 
          guest.guestName?.toLowerCase().includes(term)
        );
        break;
      case "room":
        filtered = checkIns.filter(guest => 
          guest.roomNumber?.toLowerCase().includes(term)
        );
        break;
      case "reservation":
        filtered = checkIns.filter(guest => 
          guest.reservationCode?.toLowerCase().includes(term) ||
          guest.reservationId?.toString().includes(term)
        );
        break;
      default: // all
        filtered = checkIns.filter(guest => 
          guest.guestName?.toLowerCase().includes(term) ||
          guest.roomNumber?.toLowerCase().includes(term) ||
          guest.reservationCode?.toLowerCase().includes(term) ||
          guest.reservationId?.toString().includes(term) ||
          guest.roomType?.toLowerCase().includes(term) ||
          guest.phone?.includes(term)
        );
    }

    setFilteredCheckIns(filtered);
  }, [searchTerm, searchType, checkIns]);

  // 🔹 Reset tìm kiếm
  const resetSearch = () => {
    setSearchTerm("");
    setSearchType("all");
    setFilteredCheckIns(checkIns);
  };

  // 🔹 Xác nhận checkout
  const confirmCheckOut = (guest) => {
    setSelectedGuest(guest);
    setShowConfirmModal(true);
  };

  // 🔹 Thực hiện checkout
  const handleCheckOut = async () => {
    if (!selectedGuest) return;

    try {
      setLoading(true);
      
      const reservationId = selectedGuest.reservationId;
      
      if (!reservationId) {
        throw new Error("Không tìm thấy mã đặt phòng");
      }
      
      console.log("📤 Gửi request checkout cho reservation:", reservationId);
      
      const res = await api.put(`/bookings/${reservationId}/check-out`);
      
      console.log("✅ Checkout Response:", res);

      if (res.data?.message) {
        setCheckoutDetails({
          guestName: selectedGuest.guestName,
          roomNumber: selectedGuest.roomNumber,
          message: res.data.message,
          reservationId: reservationId
        });
      }

      setSuccess(`✅ Khách ${selectedGuest.guestName} đã trả phòng ${selectedGuest.roomNumber}`);
      setShowConfirmModal(false);
      setSelectedGuest(null);
      
      // Refresh danh sách sau 2 giây
      setTimeout(() => {
        fetchCheckedInGuests();
        setCheckoutDetails(null);
        resetSearch();
      }, 2000);
      
    } catch (err) {
      console.error("❌ Lỗi khi checkout:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Không thể checkout";
      setError(`❌ Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // 🔹 Format trạng thái
  const getStatusBadge = (status) => {
    const statusUpper = status?.toString().toUpperCase();
    switch (statusUpper) {
      case "CHECKED_IN":
      case "CONFIRMED":
        return <Badge bg="success">Đang ở</Badge>;
      case "CHECKED_OUT":
      case "COMPLETED":
        return <Badge bg="secondary">Đã trả phòng</Badge>;
      case "BOOKED":
      case "PENDING":
        return <Badge bg="warning">Chờ nhận phòng</Badge>;
      default:
        return <Badge bg="info">Đang ở</Badge>;
    }
  };

  if (loading && checkIns.length === 0) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải danh sách khách đang ở...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-primary">🛎️ Quản lý Trả Phòng</h2>
        <p className="text-muted">Danh sách khách hàng đang lưu trú</p>
      </div>

      {/* Thông báo */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Thông tin thanh toán sau checkout */}
      {checkoutDetails && (
        <Alert variant="info" className="mb-4">
          <h6>✅ Thông tin trả phòng</h6>
          <hr />
          <p><strong>Khách hàng:</strong> {checkoutDetails.guestName}</p>
          <p><strong>Phòng:</strong> {checkoutDetails.roomNumber}</p>
          <p><strong>Mã đặt phòng:</strong> {checkoutDetails.reservationId}</p>
          <p><strong>Trạng thái:</strong> <Badge bg="success">Đã trả phòng</Badge></p>
        </Alert>
      )}

      {/* Thanh tìm kiếm */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={resetSearch}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tìm theo</Form.Label>
                <Form.Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="name">Tên khách hàng</option>
                  <option value="room">Số phòng</option>
                  <option value="reservation">Mã đặt phòng</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={1}>
              <Button 
                variant="outline-secondary" 
                onClick={resetSearch}
                className="w-100"
              >
                Reset
              </Button>
            </Col>
          </Row>

          {/* Hiển thị kết quả tìm kiếm */}
          {searchTerm && (
            <div className="mt-3">
              <Badge bg="info">
                Tìm thấy: {filteredCheckIns.length} / {checkIns.length} kết quả
              </Badge>
              {filteredCheckIns.length === 0 && (
                <span className="text-muted ms-2">
                  Không tìm thấy khách nào phù hợp
                </span>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Danh sách khách đang ở */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              👥 Khách đang lưu trú 
              <Badge bg="primary" className="ms-2">
                {filteredCheckIns.length}
              </Badge>
            </h5>
            {searchTerm && (
              <Badge bg="secondary">
                Đang tìm: "{searchTerm}"
              </Badge>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {filteredCheckIns.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-muted mb-2">
                <i className="fas fa-bed fa-2x"></i>
              </div>
              <h5>
                {searchTerm 
                  ? "Không tìm thấy khách hàng phù hợp" 
                  : "Không có khách nào đang ở"}
              </h5>
              <p className="text-muted">
                {searchTerm 
                  ? "Vui lòng thử lại với từ khóa khác" 
                  : "Tất cả phòng đều trống"}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline-primary" 
                  onClick={resetSearch}
                  size="sm"
                >
                  Xóa tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Mã đặt phòng</th>
                  <th>Khách hàng</th>
                  <th>Phòng</th>
                  <th>Loại phòng</th>
                  <th>Check-in</th>
                  <th>Check-out dự kiến</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCheckIns.map((guest, index) => (
                  <tr key={guest.reservationId || index}>
                    <td><strong>{index + 1}</strong></td>
                    <td>
                      <Badge bg="outline-secondary">
                        {guest.reservationCode || guest.reservationId}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <strong>{guest.guestName}</strong>
                        {guest.phone && (
                          <div className="text-muted small">
                            <i className="fas fa-phone"></i> {guest.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg="outline-primary" className="fs-6">
                        {guest.roomNumber}
                      </Badge>
                    </td>
                    <td>{guest.roomType}</td>
                    <td>
                      <small>
                        {new Date(guest.checkInDate).toLocaleDateString('vi-VN')}
                        <br />
                        <span className="text-muted">
                          {new Date(guest.checkInDate).toLocaleTimeString('vi-VN')}
                        </span>
                      </small>
                    </td>
                    <td>
                      <small>
                        {new Date(guest.checkOutDate).toLocaleDateString('vi-VN')}
                        <br />
                        <span className="text-muted">
                          {new Date(guest.checkOutDate).toLocaleTimeString('vi-VN')}
                        </span>
                      </small>
                    </td>
                    <td>
                      {getStatusBadge(guest.status)}
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmCheckOut(guest)}
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" /> : "🚪 Trả phòng"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal xác nhận checkout */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>✅ Xác nhận trả phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGuest && (
            <div>
              <p>Bạn có chắc muốn trả phòng cho khách hàng sau?</p>
              
              <div className="border p-3 rounded bg-light">
                <Row>
                  <Col md={6}>
                    <p><strong>Mã đặt phòng:</strong> {selectedGuest.reservationCode || selectedGuest.reservationId}</p>
                    <p><strong>Khách hàng:</strong> {selectedGuest.guestName}</p>
                    <p><strong>Phòng:</strong> {selectedGuest.roomNumber}</p>
                    <p><strong>Loại phòng:</strong> {selectedGuest.roomType}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Check-in:</strong> {new Date(selectedGuest.checkInDate).toLocaleString('vi-VN')}</p>
                    <p><strong>Check-out dự kiến:</strong> {new Date(selectedGuest.checkOutDate).toLocaleString('vi-VN')}</p>
                    {selectedGuest.phone && (
                      <p><strong>SĐT:</strong> {selectedGuest.phone}</p>
                    )}
                  </Col>
                </Row>
              </div>

              <Alert variant="warning" className="mt-3">
                <small>
                  ⚠️ <strong>Lưu ý:</strong> Hệ thống sẽ tự động:
                  <ul className="mt-2 mb-0">
                    <li>Tính toán tổng số tiền dựa trên thời gian lưu trú thực tế</li>
                    <li>Chuyển trạng thái phòng thành "cần dọn dẹp"</li>
                    <li>Gửi yêu cầu dọn phòng đến bộ phận housekeeping</li>
                  </ul>
                </small>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCheckOut}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              "✅ Xác nhận trả phòng"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CheckOutPage;