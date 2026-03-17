import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, Form, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/apiConfig";

const STATUS_STYLES = {
    PENDING: { label: "Chờ xử lý", bg: "secondary" },
    IN_PROGRESS: { label: "Đang dọn dẹp", bg: "primary" },
    COMPLETED: { label: "Đã hoàn thành", bg: "success" },
    CANCELLED: { label: "Đã hủy", bg: "danger" }
};

const HousekeepingManagement = () => {
    const currentUserRole = localStorage.getItem('userRole');
    const isManager = currentUserRole === 'MANAGER' || currentUserRole === 'ADMIN';

    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data tạo task mới
    const [newTask, setNewTask] = useState({
        roomId: "",
        assignedTo: "",
        type: "Dọn phòng hằng ngày",
        priority: "NORMAL",
        notes: ""
    });

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Lấy danh sách Tasks (Cần tạo API GET /api/tasks/housekeeping ở Backend Task-Service)
            const tasksRes = await api.get("/tasks/housekeeping");
            setTasks(Array.isArray(tasksRes) ? tasksRes : []);

            // 2. Lấy danh sách nhân viên (Lọc ra những người có role HOUSEKEEPING)
            const staffRes = await api.get("/user/staff"); // API User-Service đã làm ở các bước trước
            const housekeepingStaff = (Array.isArray(staffRes) ? staffRes : []).filter(
                s => s.role === 'HOUSEKEEPING' && s.status === 'ACTIVE'
            );
            setStaffList(housekeepingStaff);

            // 3. Lấy danh sách Phòng
            const roomsRes = await api.get("/rooms"); // API Room-Service
            setRooms(Array.isArray(roomsRes) ? roomsRes : []);

        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            setError("Không thể tải dữ liệu. Vui lòng kiểm tra lại server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isManager) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [isManager]);

    // --- ACTIONS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        
        if (!newTask.roomId || !newTask.assignedTo) {
            toast.warning("Vui lòng chọn Phòng và Nhân viên!");
            return;
        }

        setIsSubmitting(true);
        try {
            // Cần tạo API POST /api/tasks/housekeeping ở Backend Task-Service
            await api.post("/tasks/housekeeping", {
                roomId: parseInt(newTask.roomId),
                assignedTo: parseInt(newTask.assignedTo),
                type: newTask.type,
                priority: newTask.priority,
                status: "PENDING",
                notes: newTask.notes
            });
            
            toast.success("✅ Đã phân công dọn phòng thành công!");
            setShowModal(false);
            setNewTask({ roomId: "", assignedTo: "", type: "Dọn phòng hằng ngày", priority: "NORMAL", notes: "" });
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("❌ Lỗi khi phân công công việc.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if(!window.confirm("Bạn có chắc muốn xóa công việc này?")) return;
        try {
            await api.delete(`/tasks/housekeeping/${taskId}`);
            toast.info("🗑️ Đã xóa công việc!");
            fetchData();
        } catch (err) {
            toast.error("Lỗi khi xóa công việc.");
        }
    };

    // --- RENDER ---
    if (!isManager) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger"><h4>Không có quyền truy cập!</h4></Alert>
            </Container>
        );
    }

    if (loading) {
        return <Container className="mt-5 text-center"><Spinner animation="border" variant="primary" /></Container>;
    }

    return (
        <Container className="py-4">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <h3 className="text-primary fw-bold mb-0">📋 Quản lý Phân công Dọn phòng</h3>
                <div>
                    <Button variant="outline-primary" onClick={fetchData} className="me-2">
                        <i className="bi bi-arrow-clockwise"></i> Tải lại
                    </Button>
                    <Button variant="success" onClick={() => setShowModal(true)}>
                        ➕ Phân công việc mới
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="shadow-sm rounded table-responsive bg-white">
                <Table striped bordered hover className="align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center">ID</th>
                            <th>Phòng</th>
                            <th>Nhân viên phụ trách</th>
                            <th>Loại việc</th>
                            <th className="text-center">Trạng thái</th>
                            <th>Nhật ký/Báo cáo</th>
                            <th className="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length > 0 ? tasks.map(task => {
                            const statusInfo = STATUS_STYLES[task.status] || STATUS_STYLES.PENDING;
                            // Tìm tên nhân viên và số phòng để hiển thị cho đẹp
                            const staffName = staffList.find(s => s.id === task.assignedTo)?.fullName || `ID: ${task.assignedTo}`;
                            const roomNumber = rooms.find(r => r.id === task.roomId)?.roomNumber || `Phòng ID: ${task.roomId}`;

                            return (
                                <tr key={task.id}>
                                    <td className="text-center text-muted">{task.id}</td>
                                    <td className="fw-bold">{roomNumber}</td>
                                    <td>{staffName}</td>
                                    <td>{task.type}</td>
                                    <td className="text-center">
                                        <Badge bg={statusInfo.bg} className="p-2">{statusInfo.label}</Badge>
                                    </td>
                                    <td className="small" style={{ maxWidth: '250px' }}>
                                        {task.notes ? task.notes : <span className="text-muted fst-italic">Trống</span>}
                                    </td>
                                    <td className="text-center">
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTask(task.id)}>
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="7" className="text-center py-4">Chưa có công việc nào được phân công.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* MODAL PHÂN CÔNG */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>➕ Phân công dọn phòng</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAssignTask}>
                    <Modal.Body>
                        <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Chọn Phòng <span className="text-danger">*</span></Form.Label>
                        <Form.Select name="roomId" value={newTask.roomId} onChange={handleInputChange} required>
                            <option value="">-- Chọn phòng cần dọn --</option>
                            
                            {rooms
                                .filter(r => r.status !== 'AVAILABLE' || newTask.type === 'Tổng vệ sinh')
                                .sort((a, b) => (a.status === 'MAINTENANCE' ? -1 : 1))
                                .map(r => {
                               
                                    const statusText = r.status === 'MAINTENANCE' ? 'Đang Bảo Trì' : 
                                                     r.status === 'OCCUPIED' ? 'Đang có khách' : r.status;
                                    
                                    return (
                                        <option key={r.id} value={r.id}>
                                            Phòng {r.roomNumber} - [{statusText}] ({r.roomType?.name})
                                        </option>
                                    );
                                })
                            }
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Hệ thống ưu tiên hiển thị các phòng đang Bảo trì hoặc Đang sử dụng.
                        </Form.Text>
                    </Form.Group>
                </Col>
            
            </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Loại dọn dẹp</Form.Label>
                                    <Form.Select name="type" value={newTask.type} onChange={handleInputChange}>
                                        <option value="Dọn phòng hằng ngày">Dọn phòng hằng ngày</option>
                                        <option value="Dọn phòng sau Check-out">Dọn phòng sau Check-out</option>
                                        <option value="Tổng vệ sinh">Tổng vệ sinh</option>
                                        <option value="Xử lý sự cố">Xử lý sự cố</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Độ ưu tiên</Form.Label>
                                    <Form.Select name="priority" value={newTask.priority} onChange={handleInputChange}>
                                        <option value="LOW">Thấp</option>
                                        <option value="NORMAL">Bình thường</option>
                                        <option value="HIGH">Cao (Gấp)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Ghi chú cho nhân viên (Tùy chọn)</Form.Label>
                            <Form.Control as="textarea" rows={2} name="notes" value={newTask.notes} onChange={handleInputChange} placeholder="Ví dụ: Cần thay ga giường màu trắng, dọn kỹ nhà tắm..." />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner size="sm" animation="border" /> : "Giao việc ngay"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
};

export default HousekeepingManagement;