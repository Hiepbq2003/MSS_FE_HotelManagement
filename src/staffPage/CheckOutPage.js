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
      const res = await api.get("/checkIn/today");
      
      // 🎯 Lọc chỉ những khách đang checked_in
      const activeCheckIns = res.filter(item => 
        item.status === "checked_in" || 
        item.status === "CHECKED_IN" ||
        !item.status // Nếu không có status, mặc định là đang ở
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
      
      // 🎯 Gọi API checkout - chỉ cần roomNumber theo backend
      const payload = {
        roomNumber: selectedGuest.roomNumber
      };
      
      console.log("📤 Gửi request checkout:", payload);
      
      const res = await api.post("/checkIn/checkout", payload);
      console.log("✅ Checkout Response:", res);

      // 🎯 Hiển thị thông tin thanh toán nếu có
      if (res.totalAmount) {
        setCheckoutDetails({
          guestName: selectedGuest.guestName,
          roomNumber: selectedGuest.roomNumber,
          totalAmount: res.totalAmount,
          message: res.message
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
      const errorMsg = err.response?.data?.error || err.message || "Không thể checkout";
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
    switch (status?.toUpperCase()) {
      case "CHECKED_IN":
        return <Badge bg="success">Đang ở</Badge>;
      case "CHECKED_OUT":
        return <Badge bg="secondary">Đã trả phòng</Badge>;
      case "BOOKED":
        return <Badge bg="warning">Đã đặt</Badge>;
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
          <h6>💰 Thông tin thanh toán</h6>
          <hr />
          <p><strong>Khách hàng:</strong> {checkoutDetails.guestName}</p>
          <p><strong>Phòng:</strong> {checkoutDetails.roomNumber}</p>
          <p><strong>Tổng tiền:</strong> <span className="text-success fw-bold">{formatCurrency(checkoutDetails.totalAmount)}</span></p>
          <p><strong>Trạng thái:</strong> <Badge bg="success">Đã thanh toán</Badge></p>
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
                  <tr key={index}>
                    <td><strong>{index + 1}</strong></td>
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
                <p><strong>Khách hàng:</strong> {selectedGuest.guestName}</p>
                <p><strong>Phòng:</strong> {selectedGuest.roomNumber}</p>
                <p><strong>Loại phòng:</strong> {selectedGuest.roomType}</p>
                <p><strong>Check-in:</strong> {new Date(selectedGuest.checkInDate).toLocaleString('vi-VN')}</p>
                <p><strong>Check-out dự kiến:</strong> {new Date(selectedGuest.checkOutDate).toLocaleString('vi-VN')}</p>
              </div>

              <Alert variant="warning" className="mt-3">
                <small>
                  ⚠️ <strong>Lưu ý:</strong> Hệ thống sẽ tự động tính toán tổng số tiền 
                  dựa trên thời gian lưu trú thực tế và chuyển trạng thái phòng thành "cần dọn dẹp".
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