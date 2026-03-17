import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Spinner, Alert, Badge, Pagination } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/apiConfig"; 

const DEFAULT_HOTEL_ID = 1; 
const ALLOWED_ROLES = ['MANAGER' , 'ADMIN']; 

const ROOM_STATUSES = {
    AVAILABLE: { label: "Sẵn sàng", variant: "success" },
    OCCUPIED: { label: "Đang sử dụng", variant: "danger" },
    MAINTENANCE: { label: "Bảo trì", variant: "warning" },
    OUT_OF_SERVICE: { label: "Không có sẵn", variant: "secondary" }
};

const RoomManagement = () => {
    const currentUserRole = localStorage.getItem('userRole');

    const [allRooms, setAllRooms] = useState([]); 
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoom, setCurrentRoom] = useState({
        id: null,
        roomNumber: "",
        roomType: { id: "" }, 
        floor: 1,
        status: "AVAILABLE",
        description: ""
    });

    const [filter, setFilter] = useState({
        roomType: '',
        floor: '',
        searchQuery: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [roomsPerPage] = useState(20); 

    const getStatusBadge = (status) => {
        const safeStatus = status ? status.toUpperCase() : 'OUT_OF_SERVICE';
        const info = ROOM_STATUSES[safeStatus] || ROOM_STATUSES.OUT_OF_SERVICE;
        return <Badge bg={info.variant}>{info.label}</Badge>;
    };

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/rooms"); 
            setAllRooms(Array.isArray(response) ? response : []);
        } catch (err) {
            setError("Không thể tải danh sách phòng. Lỗi API hoặc quyền truy cập.");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchRoomTypes = async () => {
        try {
            const response = await api.get("/room-type");
            setRoomTypes(Array.isArray(response) ? response : []);
        } catch (err) {
            toast.error("Không thể tải danh sách loại phòng.");
        }
    };

    useEffect(() => {
        if (!ALLOWED_ROLES.includes(currentUserRole)) {
            setError('Bạn không có quyền truy cập trang Quản lý Phòng. Yêu cầu vai trò MANAGER.');
            setLoading(false);
            return;
        }
        fetchRooms();
        fetchRoomTypes();
    }, [currentUserRole]); 

    const canManageRooms = ALLOWED_ROLES.includes(currentUserRole);

    const filteredRooms = useMemo(() => {
        let filtered = allRooms;

        if (filter.roomType) {
            const roomTypeId = parseInt(filter.roomType);
            filtered = filtered.filter(room => room.roomType?.id === roomTypeId);
        }

        if (filter.floor) {
            const floorNum = parseInt(filter.floor);
            filtered = filtered.filter(room => room.floor === floorNum);
        }
        
        if (filter.searchQuery) {
            const searchLower = filter.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(room => 
                room.roomNumber.toLowerCase().includes(searchLower)
            );
        }

        setCurrentPage(1);
        return filtered;
    }, [allRooms, filter]);

    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const uniqueFloors = useMemo(() => {
        const floors = [...new Set(allRooms.map(room => room.floor))].sort((a, b) => a - b);
        return floors.filter(f => f != null);
    }, [allRooms]);
    
    const openModal = (room = null) => {
        if (!canManageRooms) {
            toast.error("Bạn không có quyền thực hiện thao tác này.");
            return;
        }
        
        if (room) {
            setIsEditing(true);
            setCurrentRoom({
                ...room,
                roomType: { id: room.roomType?.id?.toString() || "" }, 
                floor: room.floor || 1,
                status: room.status ? room.status.toUpperCase() : "AVAILABLE"
            });
        } else {
            setIsEditing(false);
            setCurrentRoom({
                id: null, 
                roomNumber: "", 
                roomType: { id: roomTypes[0]?.id?.toString() || "" }, 
                floor: 1, 
                status: "AVAILABLE",
                description: "" 
            });
        }
        setError(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setError(null); 
    };
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "roomType") {
            setCurrentRoom({ ...currentRoom, roomType: { id: value } });
        } else if (name === "floor") {
            const floorValue = value ? parseInt(value) : 1;
            setCurrentRoom({ ...currentRoom, [name]: floorValue });
        } else {
            setCurrentRoom({ ...currentRoom, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!canManageRooms) {
            toast.error("Bạn không có quyền thực hiện thao tác này.");
            return;
        }
        
        if (!currentRoom.roomNumber || !currentRoom.roomType.id) {
            setError("Số phòng và Loại phòng là bắt buộc!");
            toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc.");
            return;
        }

        try {
            const dataToSend = {
                ...(isEditing && { id: currentRoom.id }), 
                roomNumber: currentRoom.roomNumber,
                floor: parseInt(currentRoom.floor),
                status: currentRoom.status,
                description: currentRoom.description,
                roomTypeId: parseInt(currentRoom.roomType.id),
                hotelId: DEFAULT_HOTEL_ID 
            };
            
            if (!isEditing) delete dataToSend.id; 

            if (isEditing) {
                await api.put(`/rooms/${dataToSend.id}`, dataToSend);
                toast.success(`Cập nhật phòng ${dataToSend.roomNumber} thành công!`);
            } else {
                await api.post("/rooms", dataToSend);
                toast.success(`Thêm phòng ${dataToSend.roomNumber} mới thành công!`);
            }
            closeModal();
            fetchRooms(); 
        } catch (err) {
            let errorMessage = "Lỗi không xác định. Vui lòng thử lại.";
            
            if (err.response && err.response.data && err.response.data.message) {
                 errorMessage = err.response.data.message;
            } else if (err.message) {
                 errorMessage = err.message;
            }

            toast.error(`Lỗi khi lưu: ${errorMessage}`);
            setError(`Lỗi khi lưu: ${errorMessage}`);
        }
    };

    const handleDelete = async (id, roomNumber) => {
        if (!canManageRooms) {
            toast.error("Bạn không có quyền thực hiện thao tác này.");
            return;
        }

        if (!window.confirm(`Bạn có chắc muốn xóa phòng số "${roomNumber}" này?`)) return;
        try {
            await api.delete(`/rooms/${id}`);
            toast.info(`Đã xóa phòng số "${roomNumber}" thành công!`);
            fetchRooms();
        } catch (err) {
             let errorMessage = "Không thể xóa. Có thể phòng đang được liên kết với một Reservation.";
             if (err.response && err.response.data && err.response.data.message) {
                 errorMessage = err.response.data.message;
            } else if (err.message) {
                 errorMessage = err.message;
            }
            toast.error(`Lỗi khi xóa: ${errorMessage}`);
        }
    };

    if (error && error.includes('không có quyền truy cập')) {
        return <p className="text-danger text-center mt-5" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Lỗi: {error}</p>;
    }

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-primary">Đang tải dữ liệu phòng...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <h3 className="mb-4 text-center text-primary">Quản lý Phòng Khách sạn 🚪</h3>

            {error && !showModal && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            
            <div className="d-flex flex-wrap justify-content-between mb-3 align-items-center bg-light p-3 rounded shadow-sm">
                
                {canManageRooms && (
                    <Button variant="success" className="me-3 mb-2 mb-md-0 shadow-sm" onClick={() => openModal()}>
                        ➕ Thêm phòng mới
                    </Button>
                )}

                <Form className="d-flex flex-wrap align-items-center">
                    <Form.Group className="me-3 mb-2 mb-md-0">
                        <Form.Select
                            name="roomType"
                            value={filter.roomType}
                            onChange={handleFilterChange}
                            aria-label="Lọc theo loại phòng"
                        >
                            <option value="">Tất cả Loại phòng</option>
                            {roomTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="me-3 mb-2 mb-md-0">
                        <Form.Select
                            name="floor"
                            value={filter.floor}
                            onChange={handleFilterChange}
                            aria-label="Lọc theo tầng"
                        >
                            <option value="">Tất cả Tầng</option>
                            {uniqueFloors.map(floor => (
                                <option key={floor} value={floor}>
                                    Tầng {floor}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Control
                            type="text"
                            name="searchQuery"
                            placeholder="Tìm kiếm Số phòng..."
                            value={filter.searchQuery}
                            onChange={handleFilterChange}
                            aria-label="Tìm kiếm số phòng"
                        />
                    </Form.Group>
                </Form>
            </div>


            <div className="shadow-sm rounded table-responsive">
                <Table bordered hover className="bg-white" style={{ minWidth: '800px' }}> 
                    <thead>
                        <tr className="table-primary">
                            <th className="text-center text-nowrap" style={{ width: '50px' }}>ID</th>
                            <th className="text-nowrap" style={{ width: '100px' }}>Số phòng</th>
                            <th className="text-nowrap" style={{ width: '150px' }}>Loại phòng</th>
                            <th className="text-center text-nowrap" style={{ width: '80px' }}>Tầng</th>
                            <th className="text-center text-nowrap" style={{ width: '150px' }}>Trạng thái</th>
                            <th>Mô tả</th>
                            <th className="text-center text-nowrap" style={{ width: '140px' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRooms.length > 0 ? (
                            currentRooms.map((room) => (
                                <tr key={room.id}>
                                    <td className="text-center text-muted">{room.id}</td>
                                    <td className="fw-bold">{room.roomNumber}</td>
                                    <td>{room.roomType?.name || room.roomType?.code || 'N/A'}</td>
                                    <td className="text-center">{room.floor}</td>
                                    <td className="text-center">
                                        {getStatusBadge(room.status)}
                                    </td>
                                    <td>{room.description?.substring(0, 50) + (room.description?.length > 50 ? '...' : '')}</td>
                                    <td className="text-center">
                                         {canManageRooms ? (
                                            <>
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => openModal(room)}
                                                >Sửa</Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(room.id, room.roomNumber)}
                                                >Xóa</Button>
                                            </>
                                        ) : (
                                            <span className="text-muted">Không có quyền</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                    Không có phòng nào phù hợp với điều kiện tìm kiếm/lọc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
            
            {filteredRooms.length > roomsPerPage && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                        <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                        
                        {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item 
                                key={i + 1} 
                                active={i + 1 === currentPage} 
                                onClick={() => paginate(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}

                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}

            {canManageRooms && (
                <Modal show={showModal} onHide={closeModal}>
                    <Modal.Header closeButton className={isEditing ? "bg-warning text-white" : "bg-primary text-white"}>
                        <Modal.Title>{isEditing ? "Sửa thông tin Phòng" : "Thêm Phòng mới"}</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form.Group className="mb-3">
                                <Form.Label>Số phòng <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="roomNumber"
                                    value={currentRoom.roomNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Loại phòng <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="roomType"
                                    value={currentRoom.roomType.id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">-- Chọn Loại Phòng --</option>
                                    {roomTypes.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.name} ({type.code})
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <div className="row">
                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>Tầng</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="floor"
                                        value={currentRoom.floor}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3 col-md-6">
                                    <Form.Label>Trạng thái</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={currentRoom.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {Object.entries(ROOM_STATUSES).map(([key, value]) => (
                                            <option key={key} value={key}>{value.label}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả (Ghi chú về phòng)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={currentRoom.description}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={closeModal}>Hủy</Button>
                            <Button type="submit" variant={isEditing ? "warning" : "primary"}>
                                {isEditing ? "Lưu thay đổi" : "Thêm mới"}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            )}
        </div>
    );
};

export default RoomManagement;