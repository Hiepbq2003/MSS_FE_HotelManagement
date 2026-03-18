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
} from "react-bootstrap";

const CheckOutPage = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [checkoutDetails, setCheckoutDetails] = useState(null);

  // 🔹 Tải danh sách khách đang check-in
  const fetchCheckedInGuests = async () => {
    try {
      setLoading(true);
      // SỬA: dùng endpoint đúng /checkin/today (chữ thường)
      const res = await api.get("/bookings/checkin/current-guests");
      
      // 🎯 Lọc chỉ những khách đang checked_in
      const activeCheckIns = res.filter(item => 
        item.status === "CHECKED_IN" || 
        item.status === "checked_in" ||
        item.status === "CONFIRMED" ||
        (item.status && item.status.toString().toUpperCase() === "CHECKED_IN")
      );
      
      setCheckIns(activeCheckIns);
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
      
      // 🎯 Gọi API checkout với reservationId (từ backend)
      const reservationId = selectedGuest.reservationId;
      
      if (!reservationId) {
        throw new Error("Không tìm thấy mã đặt phòng");
      }
      
      console.log("📤 Gửi request checkout cho reservation:", reservationId);
      
      // SỬA: dùng endpoint /api/bookings/{id}/check-out từ BookingController
      const res = await api.put(`/bookings/${reservationId}/check-out`);
      
      console.log("✅ Checkout Response:", res);

      // 🎯 Hiển thị thông tin thanh toán nếu có
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

      {/* Danh sách khách đang ở */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            👥 Khách đang lưu trú 
            <Badge bg="primary" className="ms-2">{checkIns.length}</Badge>
          </h5>
        </Card.Header>
        <Card.Body>
          {checkIns.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-muted mb-2">
                <i className="fas fa-bed fa-2x"></i>
              </div>
              <h5>Không có khách nào đang ở</h5>
              <p className="text-muted">Tất cả phòng đều trống</p>
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
                {checkIns.map((guest, index) => (
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
                        {guest.phone && <div className="text-muted small">{guest.phone}</div>}
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
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>✅ Xác nhận trả phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGuest && (
            <div>
              <p>Bạn có chắc muốn trả phòng cho khách hàng sau?</p>
              
              <div className="border p-3 rounded bg-light">
                <p><strong>Mã đặt phòng:</strong> {selectedGuest.reservationCode || selectedGuest.reservationId}</p>
                <p><strong>Khách hàng:</strong> {selectedGuest.guestName}</p>
                <p><strong>Phòng:</strong> {selectedGuest.roomNumber}</p>
                <p><strong>Loại phòng:</strong> {selectedGuest.roomType}</p>
                <p><strong>Check-in:</strong> {new Date(selectedGuest.checkInDate).toLocaleString('vi-VN')}</p>
                <p><strong>Check-out dự kiến:</strong> {new Date(selectedGuest.checkOutDate).toLocaleString('vi-VN')}</p>
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