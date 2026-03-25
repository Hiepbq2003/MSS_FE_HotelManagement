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
  const [createTask, setCreateTask] = useState(true);

  // State cho room types
  const [roomTypes, setRoomTypes] = useState([]);
  const [floors, setFloors] = useState([]);
  
  // State cho staff list
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [showStaffSelect, setShowStaffSelect] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // State cho modal xem tasks
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedRoomTasks, setSelectedRoomTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

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

  // 🔹 Load danh sách nhân viên Housekeeping từ API
  const fetchStaffList = async () => {
    try {
      setLoadingStaff(true);
      // Gọi API lấy danh sách nhân viên housekeeping
      const res = await api.get("/user/staff/housekeeping");
      setStaffList(res || []);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách nhân viên:", err);
      // Mock data fallback
      setStaffList([
        { id: 1, name: "Nguyễn Văn A", position: "Housekeeping Staff" },
        { id: 2, name: "Trần Thị B", position: "Housekeeping Staff" },
        { id: 3, name: "Lê Văn C", position: "Housekeeping Staff" },
      ]);
    } finally {
      setLoadingStaff(false);
    }
  };

  // 🔹 Lấy tasks theo phòng
  const fetchTasksByRoom = async (roomId) => {
    try {
      setLoadingTasks(true);
      const res = await api.get(`/tasks/housekeeping/room/${roomId}`);
      setSelectedRoomTasks(res || []);
    } catch (err) {
      console.error("❌ Lỗi tải tasks:", err);
      setSelectedRoomTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    fetchStaffList();
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

    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.roomType?.name && room.roomType.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    if (roomTypeFilter !== "all") {
      filtered = filtered.filter(room => room.roomType?.code === roomTypeFilter);
    }

    if (floorFilter !== "all") {
      filtered = filtered.filter(room => room.floor === parseInt(floorFilter));
    }

    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roomTypeFilter, floorFilter, rooms]);

  // 🔹 Tính toán dữ liệu phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // 🔹 Tạo số trang cho pagination
  const getVisiblePages = () => {
    const delta = 2;
    const rangeWithDots = [];
    let range = [];

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

  // 🔹 Tạo housekeeping task - Cập nhật để dùng API đúng
  const createHousekeepingTask = async (room, newStatus, assignedTo = null) => {
    try {
      const taskData = {
        roomId: room.id,
        roomNumber: room.roomNumber,
        reservationId: room.currentReservationId || null,
        type: newStatus === "maintenance" ? "Bảo trì phòng" : "Dọn phòng sau Check-out",
        priority: newStatus === "maintenance" ? "HIGH" : "NORMAL",
        assignedTo: assignedTo || selectedStaffId || null,
        status: "PENDING",
        notes: `Phòng ${room.roomNumber} cần ${newStatus === "maintenance" ? "bảo trì" : "dọn dẹp"}. ${newStatus === "maintenance" ? "Kiểm tra và sửa chữa các thiết bị hỏng." : "Dọn dẹp, thay ga giường, vệ sinh phòng."}`
      };

      const response = await api.post("/tasks/housekeeping", taskData);
      console.log("✅ Đã tạo task:", response);
      return response.data;
    } catch (err) {
      console.error("❌ Lỗi tạo task:", err);
      return null;
    }
  };

  // 🔹 Tạo task dọn phòng từ reservation
  const createCleaningTaskFromReservation = async (reservationId, roomId, roomNumber) => {
    try {
      const response = await api.post(`/tasks/create-cleaning-task?reservationId=${reservationId}&roomId=${roomId}&roomNumber=${roomNumber}`);
      console.log("✅ Đã tạo task dọn phòng:", response);
      return response.data;
    } catch (err) {
      console.error("❌ Lỗi tạo task dọn phòng:", err);
      return null;
    }
  };

  // 🔹 Xử lý mở modal change status
  const handleOpenStatusModal = (room) => {
    setSelectedRoom(room);
    setNewStatus(room.status);
    setSelectedStaffId("");
    setShowStaffSelect(false);
    setCreateTask(true);
    setShowStatusModal(true);
  };

  // 🔹 Xử lý mở modal xem tasks
  const handleOpenTasksModal = async (room) => {
    setSelectedRoom(room);
    await fetchTasksByRoom(room.id);
    setShowTasksModal(true);
  };

  // 🔹 Xử lý thay đổi status
  const handleChangeStatus = async () => {
    if (!selectedRoom || !newStatus) return;

    try {
      setUpdating(true);
      
      const oldStatus = selectedRoom.status;
      
      // Cập nhật room status
      await api.put(`/rooms/${selectedRoom.id}`, {
        roomNumber: selectedRoom.roomNumber,
        roomTypeId: selectedRoom.roomType?.id,
        floor: selectedRoom.floor,
        status: newStatus,
        description: selectedRoom.description
      });

      // Tạo task nếu cần
      if (createTask && newStatus !== oldStatus) {
        let taskResult = null;
        
        // Trường hợp 1: Chuyển sang Bảo trì
        if (newStatus === "maintenance") {
          taskResult = await createHousekeepingTask(selectedRoom, newStatus);
          if (taskResult) {
            setSuccess(`✅ Đã cập nhật trạng thái phòng ${selectedRoom.roomNumber} thành Bảo trì và tạo task #${taskResult.task?.id || ''} cho nhân viên!`);
          } else {
            setSuccess(`✅ Đã cập nhật trạng thái phòng ${selectedRoom.roomNumber} thành Bảo trì!`);
          }
        } 
        // Trường hợp 2: Chuyển từ Đã thuê sang Có sẵn (cần dọn phòng)
        else if (oldStatus === "occupied" && newStatus === "available") {
          // Nếu có reservationId, dùng endpoint riêng
          if (selectedRoom.currentReservationId) {
            taskResult = await createCleaningTaskFromReservation(
              selectedRoom.currentReservationId, 
              selectedRoom.id, 
              selectedRoom.roomNumber
            );
          } else {
            taskResult = await createHousekeepingTask(selectedRoom, newStatus);
          }
          
          if (taskResult) {
            setSuccess(`✅ Đã cập nhật trạng thái phòng ${selectedRoom.roomNumber} thành Có sẵn và tạo task dọn phòng!`);
          } else {
            setSuccess(`✅ Đã cập nhật trạng thái phòng ${selectedRoom.roomNumber} thành Có sẵn!`);
          }
        }
        else {
          setSuccess(`✅ Đã cập nhật trạng thái phòng ${selectedRoom.roomNumber} thành ${getStatusLabel(newStatus)}`);
        }
      } else {
        setSuccess(`✅ Đã cập nhật trạng thái phòng ${selectedRoom.roomNumber} thành ${getStatusLabel(newStatus)}`);
      }

      setShowStatusModal(false);
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

  // 🔹 Get task status badge
  const getTaskStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "ASSIGNED":
        return "info";
      case "IN_PROGRESS":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "danger";
      default:
        return "secondary";
    }
  };

  // 🔹 Get task status label
  const getTaskStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "ASSIGNED":
        return "Đã phân công";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
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
                      <td className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenStatusModal(room)}
                        >
                          Đổi trạng thái
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleOpenTasksModal(room)}
                        >
                          Xem task
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

      {/* Modal Change Status */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg">
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

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái mới</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    // Hiển thị chọn nhân viên nếu chọn Bảo trì hoặc Dọn phòng
                    if (e.target.value === "maintenance" || 
                        (selectedRoom.status === "occupied" && e.target.value === "available")) {
                      setShowStaffSelect(true);
                    } else {
                      setShowStaffSelect(false);
                    }
                  }}
                >
                  <option value="available">Có sẵn</option>
                  <option value="occupied">Đã thuê</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="out_of_service">Ngừng hoạt động</option>
                </Form.Select>
              </Form.Group>

              {/* Option tạo task */}
              {(newStatus === "maintenance" || 
                (selectedRoom.status === "occupied" && newStatus === "available")) && (
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Tạo task cho nhân viên Housekeeping"
                    checked={createTask}
                    onChange={(e) => setCreateTask(e.target.checked)}
                  />
                </Form.Group>
              )}

              {/* Chọn nhân viên */}
              {showStaffSelect && createTask && (
                <Form.Group className="mb-3">
                  <Form.Label>Chọn nhân viên phụ trách</Form.Label>
                  <Form.Select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    disabled={loadingStaff}
                  >
                    <option value="">Chưa phân công</option>
                    {staffList.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.fullName} - {staff.role}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Nếu không chọn, task sẽ được tạo và chờ phân công sau
                  </Form.Text>
                </Form.Group>
              )}

              <Alert variant="info" className="mt-3">
                <small>
                  💡 <strong>Lưu ý:</strong> 
                  <br/>- <strong>Có sẵn</strong>: Phòng sẵn sàng cho khách check-in
                  <br/>- <strong>Đã thuê</strong>: Phòng đang có khách
                  <br/>- <strong>Bảo trì</strong>: Phòng đang được sửa chữa (sẽ tạo task cho Housekeeping)
                  <br/>- <strong>Ngừng HĐ</strong>: Phòng không thể sử dụng
                  <br/>- Khi chuyển từ <strong>Đã thuê → Có sẵn</strong>: Tự động tạo task dọn phòng
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

      {/* Modal View Tasks */}
      <Modal show={showTasksModal} onHide={() => setShowTasksModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Danh sách Task của phòng {selectedRoom?.roomNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingTasks ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
              <p className="mt-2">Đang tải danh sách task...</p>
            </div>
          ) : selectedRoomTasks.length === 0 ? (
            <Alert variant="info">Chưa có task nào cho phòng này</Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loại</th>
                  <th>Độ ưu tiên</th>
                  <th>Trạng thái</th>
                  <th>Nhân viên</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {selectedRoomTasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.type}</td>
                    <td>
                      <Badge bg={task.priority === "HIGH" ? "danger" : "secondary"}>
                        {task.priority === "HIGH" ? "Cao" : "Bình thường"}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getTaskStatusBadge(task.status)}>
                        {getTaskStatusLabel(task.status)}
                      </Badge>
                    </td>
                    <td>{task.assignedTo ? `NV-${task.assignedTo}` : "Chưa phân công"}</td>
                    <td>{task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTasksModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoomManagement;