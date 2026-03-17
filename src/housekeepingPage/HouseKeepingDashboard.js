import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Spinner, Alert, Navbar, Nav, Dropdown } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaHome, FaSignOutAlt, FaSyncAlt, FaExclamationTriangle, FaCheckCircle, FaPlay } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import api from "../api/apiConfig";
import 'react-toastify/dist/ReactToastify.css';

const STATUS_MAP = {
    PENDING: { label: "Chờ xử lý", bg: "secondary", icon: <FaPlay className="me-2" /> },
    IN_PROGRESS: { label: "Đang dọn dẹp", bg: "primary", icon: <Spinner size="sm" className="me-2" /> },
    COMPLETED: { label: "Hoàn thành", bg: "success", icon: <FaCheckCircle className="me-2" /> },
    CANCELLED: { label: "Đã hủy", bg: "danger", icon: <FaExclamationTriangle className="me-2" /> }
};

const HouseKeepingDashboard = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [logNote, setLogNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fullName = localStorage.getItem('fullName') || 'Staff';
    const currentStaffId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const isHousekeeping = userRole === 'HOUSEKEEPING' || userRole === 'MANAGER';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('fullName');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    const fetchTasks = useCallback(async () => {
        if (!currentStaffId) {
            setError("Phiên đăng nhập hết hạn.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/tasks/housekeeping/staff/${currentStaffId}`);
            const data = Array.isArray(response) ? response : [];
            const priority = { 'IN_PROGRESS': 1, 'PENDING': 2, 'COMPLETED': 3, 'CANCELLED': 4 };
            setTasks(data.sort((a, b) => (priority[a.status] || 5) - (priority[b.status] || 5)));
            setError(null);
        } catch (err) {
            setError("Không thể tải danh sách công việc.");
        } finally {
            setLoading(false);
        }
    }, [currentStaffId]);

    useEffect(() => {
        if (isHousekeeping) fetchTasks();
        else setLoading(false);
    }, [isHousekeeping, fetchTasks]);

    const updateStatus = async (taskId, newStatus, autoNote = "") => {
        try {
            await api.put(`/tasks/housekeeping/staff/${taskId}/status`, { status: newStatus, notes: autoNote });
            toast.success(`Trạng thái: ${STATUS_MAP[newStatus].label}`);
            fetchTasks();
        } catch (err) {
            toast.error("Cập nhật thất bại!");
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        if (!logNote.trim()) return toast.warning("Vui lòng nhập báo cáo!");
        setIsSubmitting(true);
        try {
            await api.put(`/tasks/housekeeping/staff/${selectedTask.id}/status`, {
                status: selectedTask.status,
                notes: logNote
            });
            toast.info("Đã gửi báo cáo.");
            setShowLogModal(false);
            fetchTasks();
        } catch (err) {
            toast.error("Lỗi gửi báo cáo!");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isHousekeeping) return (
        <Container className="py-5 text-center">
            <Alert variant="danger" className="shadow-lg border-0 rounded-4 p-5">
                <FaExclamationTriangle size={50} className="mb-3" />
                <h3>TRUY CẬP BỊ TỪ CHỐI</h3>
                <p>Khu vực này chỉ dành cho nhân viên dọn phòng.</p>
                <Button variant="danger" onClick={() => navigate('/')} className="rounded-pill px-4">Quay về Trang chủ</Button>
            </Alert>
        </Container>
    );

    return (
        <div style={{ backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
            <ToastContainer position="top-right" />

            <Navbar bg="white" expand="lg" className="shadow-sm sticky-top mb-4 py-3">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
                        ✨<span style={{ color: '#FFBF58' }}>Mr.</span>STELLAR <small className="text-muted fs-6 ms-2">| STAFF</small>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="staff-nav" />
                    <Navbar.Collapse id="staff-nav">
                        <Nav className="ms-auto align-items-center">
                            <Nav.Link as={Link} to="/" className="me-3 fw-medium text-dark">
                                <FaHome className="me-1" /> Trang chủ
                            </Nav.Link>
                            <Button variant="outline-primary" size="sm" className="me-4 rounded-pill px-3" onClick={fetchTasks}>
                                <FaSyncAlt className="me-1" /> Làm mới
                            </Button>
                            
                            <Dropdown align="end">
                                <Dropdown.Toggle id="user-dropdown" className="bg-transparent border-0 text-dark p-0 fw-bold d-flex align-items-center">
                                    <div className="bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                                        <FaUser size={14} />
                                    </div>
                                    {fullName}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="shadow border-0 rounded-3 mt-2">
                                    <Dropdown.Header>Quản lý tài khoản</Dropdown.Header>
                                    <Dropdown.Item as={Link} to="/profile">Thông tin cá nhân</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                                        <FaSignOutAlt className="me-2" /> Đăng xuất
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container>
                <header className="mb-4">
                    <h3 className="fw-black text-dark mb-1 text-uppercase">Danh sách nhiệm vụ</h3>
                    <p className="text-muted small">Quản lý và cập nhật tiến độ dọn dẹp các phòng được giao.</p>
                </header>

                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-dashed">
                        <h4 className="text-muted">Không có phòng nào cần dọn!</h4>
                        <p className="text-muted small">Hãy nghỉ ngơi hoặc kiểm tra lại sau.</p>
                    </div>
                ) : (
                    <Row className="g-4">
                        {tasks.map(task => {
                            const cfg = STATUS_MAP[task.status] || STATUS_MAP.PENDING;
                            return (
                                <Col md={6} lg={4} key={task.id}>
                                    <Card className="h-100 border-0 shadow-sm rounded-4 hover-card overflow-hidden">
                                        <div className={`bg-${cfg.bg}`} style={{ height: '6px' }}></div>
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h4 className="fw-bold mb-0">Phòng {task.roomId}</h4>
                                                    <small className="text-muted">{task.type || "Dọn dẹp hằng ngày"}</small>
                                                </div>
                                                <Badge bg={cfg.bg} className="p-2 px-3 rounded-pill text-uppercase">{cfg.label}</Badge>
                                            </div>

                                            <div className="bg-light rounded-3 p-3 mb-4" style={{ minHeight: '80px' }}>
                                                <small className="fw-bold text-uppercase text-muted d-block mb-1" style={{ fontSize: '0.65rem' }}>Ghi chú gần nhất</small>
                                                <div className="text-dark small lh-base">
                                                    {task.notes || <span className="text-muted fst-italic">Không có ghi chú</span>}
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                {task.status === 'PENDING' && (
                                                    <Button variant="primary" className="w-100 fw-bold rounded-3 py-2" 
                                                        onClick={() => updateStatus(task.id, 'IN_PROGRESS', 'Bắt đầu dọn dẹp')}>
                                                        BẮT ĐẦU DỌN
                                                    </Button>
                                                )}
                                                {task.status === 'IN_PROGRESS' && (
                                                    <>
                                                        <Button variant="outline-warning" className="w-50 fw-bold rounded-3" 
                                                            onClick={() => { setSelectedTask(task); setLogNote(""); setShowLogModal(true); }}>
                                                            BÁO CÁO
                                                        </Button>
                                                        <Button variant="success" className="w-50 fw-bold rounded-3" 
                                                            onClick={() => updateStatus(task.id, 'COMPLETED', 'Đã hoàn thành sạch sẽ')}>
                                                            XONG
                                                        </Button>
                                                    </>
                                                )}
                                                {task.status === 'COMPLETED' && (
                                                    <Button variant="light" className="w-100 fw-bold text-success rounded-3 border-success-subtle" disabled>
                                                        SẴN SÀNG ĐÓN KHÁCH
                                                    </Button>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Container>

            <Modal show={showLogModal} onHide={() => setShowLogModal(false)} centered contentClassName="border-0 shadow-lg rounded-4">
                <Modal.Header closeButton className="border-0 p-4 pb-0">
                    <Modal.Title className="fw-bold">Báo cáo tình trạng Phòng {selectedTask?.roomId}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleLogSubmit}>
                    <Modal.Body className="p-4">
                        <Form.Group>
                            <Form.Label className="small fw-bold">Nội dung ghi chú / Sự cố</Form.Label>
                            <Form.Control 
                                as="textarea" rows={4} value={logNote}
                                onChange={(e) => setLogNote(e.target.value)}
                                placeholder="VD: Khách làm vỡ ly, tivi không lên nguồn..."
                                className="bg-light border-0 rounded-3 p-3"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-4 pt-0">
                        <Button variant="light" onClick={() => setShowLogModal(false)} className="rounded-pill px-4">Hủy</Button>
                        <Button variant="warning" type="submit" disabled={isSubmitting} className="rounded-pill px-4 fw-bold">
                            {isSubmitting ? <Spinner size="sm" /> : "Gửi báo cáo"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <style>{`
                .hover-card { transition: all 0.3s ease; border: 1px solid #eee !important; }
                .hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
                .fw-black { font-weight: 900; }
                .nav-link:hover { color: #FFBF58 !important; }
                .dropdown-item:active { background-color: #FFBF58; }
            `}</style>
        </div>
    );
};

export default HouseKeepingDashboard;