import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Modal,
  Pagination,
} from "react-bootstrap";
import api from "../api/apiConfig";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State cho search và filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State cho modal change status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // State cho room types
  const [roomTypes, setRoomTypes] = useState([]);
  const [floors, setFloors] = useState([]);

  // 🔹 Load danh sách rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rooms");
      setRooms(res || []);
      setFilteredRooms(res || []);
      setError(null);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách phòng:", err);
      setError("Không thể tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load room types
  const fetchRoomTypes = async () => {
    try {
      const res = await api.get("/room-type/hotel/1");
      setRoomTypes(res || []);
    } catch (err) {
      console.error("❌ Lỗi tải room types:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  // 🔹 Extract unique floors từ rooms
  useEffect(() => {
    if (rooms.length > 0) {
      const uniqueFloors = [...new Set(rooms.map(room => room.floor).filter(Boolean))].sort();
      setFloors(uniqueFloors);
    }
  }, [rooms]);

  // 🔹 Filter rooms
  useEffect(() => {
    let filtered = rooms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.roomType?.name && room.roomType.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    // Room type filter
    if (roomTypeFilter !== "all") {
      filtered = filtered.filter(room => room.roomType?.code === roomTypeFilter);
    }

    // Floor filter
    if (floorFilter !== "all") {
      filtered = filtered.filter(room => room.floor === parseInt(floorFilter));
    }

    setFilteredRooms(filtered);
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [searchTerm, statusFilter, roomTypeFilter, floorFilter, rooms]);

  // 🔹 Tính toán dữ liệu phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // 🔹 Tạo số trang cho pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // 🔹 Hiển thị tối đa 5 trang
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // 🔹 Xử lý mở modal change status
  const handleOpenStatusModal = (room) => {
    setSelectedRoom(room);
    setNewStatus(room.status);
    setShowStatusModal(true);
  };

  // 🔹 Xử lý thay đổi status
  const handleChangeStatus = async () => {
    if (!selectedRoom || !newStatus) return;

    try {
      setUpdating(true);
      
      // Cập nhật room status
      await api.put(`/rooms/${selectedRoom.id}`, {
        roomNumber: selectedRoom.roomNumber,
        roomTypeId: selectedRoom.roomType?.id,
        floor: selectedRoom.floor,
        status: newStatus,
        description: selectedRoom.description
      });

      setSuccess(`✅ Đã cập nhật trạng thái phòng ${selectedRoom.roomNumber} thành ${getStatusLabel(newStatus)}`);
      setShowStatusModal(false);
      
      // Refresh danh sách
      fetchRooms();
      
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      setError("Lỗi cập nhật trạng thái phòng");
    } finally {
      setUpdating(false);
    }
  };

  // 🔹 Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "occupied":
        return "primary";
      case "maintenance":
        return "warning";
      case "out_of_service":
        return "danger";
      default:
        return "secondary";
    }
  };

  // 🔹 Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "occupied":
        return "Đã thuê";
      case "maintenance":
        return "Bảo trì";
      case "out_of_service":
        return "Ngừng hoạt động";
      default:
        return status;
    }
  };

  // 🔹 Get room type name
  const getRoomTypeName = (roomType) => {
    return roomType?.name || "N/A";
  };

  return (
    <Container className="mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Reception - Quản lý Phòng</h3>
          <p className="text-muted">Quản lý trạng thái và thông tin phòng</p>
        </div>
        <Badge bg="light" text="dark">
          Tổng: {rooms.length} phòng
        </Badge>
      </div>

      {/* Search và Filter Section */}
      <Card className="p-3 shadow-sm mb-4">
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Tìm kiếm</Form.Label>
              <Form.Control
                type="text"
                placeholder="Tìm theo số phòng, loại phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="available">Có sẵn</option>
                <option value="occupied">Đã thuê</option>
                <option value="maintenance">Bảo trì</option>
                <option value="out_of_service">Ngừng HĐ</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Loại phòng</Form.Label>
              <Form.Select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {roomTypes.map(type => (
                  <option key={type.id} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Tầng</Form.Label>
              <Form.Select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {floors.map(floor => (
                  <option key={floor} value={floor}>
                    Tầng {floor}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Số lượng / trang</Form.Label>
              <Form.Select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 phòng</option>
                <option value={10}>10 phòng</option>
                <option value={20}>20 phòng</option>
                <option value={50}>50 phòng</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={1} className="d-flex align-items-end">
            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRoomTypeFilter("all");
                setFloorFilter("all");
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Thông báo */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {/* Thống kê */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Badge bg="info" className="me-2">
            Hiển thị: {currentRooms.length} / {filteredRooms.length} phòng
          </Badge>
          <Badge bg="secondary">
            Trang {currentPage} / {totalPages}
          </Badge>
        </div>
        <div>
          <small className="text-muted">
            Tổng số phòng: {rooms.length} | Đang lọc: {filteredRooms.length}
          </small>
        </div>
      </div>

      {/* Danh sách phòng */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Danh sách Phòng</h5>
            <div>
              <Badge bg="primary" className="me-2">{filteredRooms.length} phòng</Badge>
              <Badge bg="success">{currentRooms.length} đang hiển thị</Badge>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
              <p className="mt-2">Đang tải danh sách phòng...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center p-4">
              <Alert variant="info">
                {searchTerm || statusFilter !== "all" || roomTypeFilter !== "all" || floorFilter !== "all" 
                  ? "Không tìm thấy phòng phù hợp" 
                  : "Không có phòng nào"}
              </Alert>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Số phòng</th>
                    <th>Tầng</th>
                    <th>Loại phòng</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRooms.map((room, index) => (
                    <tr key={room.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>
                        <strong>{room.roomNumber}</strong>
                      </td>
                      <td>{room.floor || "N/A"}</td>
                      <td>{getRoomTypeName(room.roomType)}</td>
                      <td>
                        <Badge bg={getStatusBadge(room.status)}>
                          {getStatusLabel(room.status)}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {room.description || "Không có mô tả"}
                        </small>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenStatusModal(room)}
                        >
                          Đổi trạng thái
                        </Button>
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
                      Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRooms.length)} của {filteredRooms.length} phòng
                    </small>
                  </div>
                  
                  <Pagination className="mb-0">
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)} 
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />

                    {getVisiblePages().map((pageNumber, index) => (
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
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>

                  <div>
                    <Form.Select
                      size="sm"
                      style={{ width: '80px' }}
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                    >
                      {pageNumbers.map(number => (
                        <option key={number} value={number}>
                          {number}
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

      {/* Modal Change Status */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đổi trạng thái phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <div>
              <p>Thay đổi trạng thái cho phòng:</p>
              <div className="border p-3 rounded bg-light mb-3">
                <p><strong>Số phòng:</strong> {selectedRoom.roomNumber}</p>
                <p><strong>Loại phòng:</strong> {getRoomTypeName(selectedRoom.roomType)}</p>
                <p><strong>Trạng thái hiện tại:</strong> 
                  <Badge bg={getStatusBadge(selectedRoom.status)} className="ms-2">
                    {getStatusLabel(selectedRoom.status)}
                  </Badge>
                </p>
              </div>

              <Form.Group>
                <Form.Label>Trạng thái mới</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="available">Có sẵn</option>
                  <option value="occupied">Đã thuê</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="out_of_service">Ngừng hoạt động</option>
                </Form.Select>
              </Form.Group>

              <Alert variant="info" className="mt-3">
                <small>
                  💡 <strong>Lưu ý:</strong> 
                  <br/>- <strong>Có sẵn</strong>: Phòng sẵn sàng cho khách check-in
                  <br/>- <strong>Đã thuê</strong>: Phòng đang có khách
                  <br/>- <strong>Bảo trì</strong>: Phòng đang được sửa chữa
                  <br/>- <strong>Ngừng HĐ</strong>: Phòng không thể sử dụng
                </small>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowStatusModal(false)}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleChangeStatus}
            disabled={updating || newStatus === selectedRoom?.status}
          >
            {updating ? <Spinner size="sm" /> : "Xác nhận"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoomManagement;