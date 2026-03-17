import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { 
    FaUserCircle, FaEnvelope, FaIdBadge, FaUser, 
    FaPhoneAlt, FaLock, FaEdit, FaShieldAlt, FaCamera 
} from 'react-icons/fa';
import api from '../api/apiConfig';
import { toast, ToastContainer } from 'react-toastify'; // Khuyên dùng thay cho alert
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: '...',
        email: '...',
        phone: '...',
        role: 'GUEST',
    });

    // Modal & Form States
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({ fullName: '', phone: '' });
    const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setUserInfo({
            fullName: localStorage.getItem('fullName') || 'Guest User',
            email: localStorage.getItem('email') || 'N/A',
            phone: localStorage.getItem('phone') || 'Chưa cập nhật',
            role: localStorage.getItem('userRole') || 'CUSTOMER',
        });
    }, [navigate]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const requestBody = {
                email: userInfo.email,
                fullName: editProfileForm.fullName.trim(),
                phone: editProfileForm.phone.trim()
            };
            await api.put('/auth/user/profile', requestBody);

            localStorage.setItem('fullName', requestBody.fullName);
            localStorage.setItem('phone', requestBody.phone);
            
            setUserInfo(prev => ({ ...prev, ...requestBody }));
            setShowProfileModal(false);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword.new !== newPassword.confirm) return toast.error("Mật khẩu không khớp!");
        
        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                email: userInfo.email,
                currentPassword: newPassword.current,
                newPassword: newPassword.new
            });
            setShowPasswordModal(false);
            toast.info("Đổi mật khẩu thành công! Đang đăng xuất...");
            setTimeout(() => {
                localStorage.clear();
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Mật khẩu hiện tại không đúng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <ToastContainer position="top-right" autoClose={3000} />
            
            {/* --- Custom Breadcrumb Area --- */}
            <div className="py-3 border-bottom bg-white shadow-sm mb-4">
                <Container>
                    <div className="d-flex align-items-center small fw-bold">
                        <Link to="/" className="text-decoration-none text-primary d-flex align-items-center">
                            🏠 <span className="ms-1">Home</span>
                        </Link>
                        <span className="mx-2 text-muted">{'>'}</span>
                        <span className="text-success text-uppercase" style={{ letterSpacing: '1px' }}>Profile</span>
                    </div>
                </Container>
            </div>

            <Container className="pb-5">
                <Row className="justify-content-center">
                    {/* Left Column: Avatar & Summary */}
                    <Col lg={4} className="mb-4">
                        <Card className="border-0 shadow-sm text-center p-4 rounded-4 h-100">
                            <div className="position-relative mx-auto mb-3" style={{ width: '120px' }}>
                                <div className="rounded-circle overflow-hidden border border-4 border-white shadow-sm bg-light d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                                    <FaUserCircle size={100} color="#dee2e6" />
                                </div>
                                <button className="btn btn-warning btn-sm position-absolute bottom-0 end-0 rounded-circle shadow">
                                    <FaCamera size={12} />
                                </button>
                            </div>
                            <h4 className="fw-bold mb-1">{userInfo.fullName}</h4>
                            <p className="text-muted small mb-3">{userInfo.email}</p>
                            <Badge bg="soft-success" className="rounded-pill px-3 py-2 mb-3" 
                                style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '0.8rem' }}>
                                <FaShieldAlt className="me-1" /> {userInfo.role} Account
                            </Badge>
                            <hr className="w-100 opacity-10" />
                            <div className="text-start mt-2">
                                <small className="text-muted d-block text-uppercase fw-bold mb-2" style={{ fontSize: '0.65rem' }}>Trạng thái bảo mật</small>
                                <div className="d-flex align-items-center text-success small">
                                    <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                                    Tài khoản đã xác thực
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Right Column: Detailed Info */}
                    <Col lg={7}>
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                            <div className="p-4 border-bottom bg-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">Thông tin cá nhân</h5>
                                <Button variant="outline-primary" size="sm" className="rounded-pill px-3" 
                                    onClick={() => {
                                        setEditProfileForm({ fullName: userInfo.fullName, phone: userInfo.phone });
                                        setShowProfileModal(true);
                                    }}>
                                    <FaEdit className="me-1" /> Chỉnh sửa
                                </Button>
                            </div>
                            <Card.Body className="p-4">
                                <Row className="mb-4">
                                    <Col sm={6} className="mb-3 mb-sm-0">
                                        <label className="text-muted small fw-bold mb-1 d-block">Họ và Tên</label>
                                        <div className="d-flex align-items-center p-3 rounded-3 bg-light">
                                            <FaIdBadge className="text-warning me-3" />
                                            <span className="fw-medium">{userInfo.fullName}</span>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <label className="text-muted small fw-bold mb-1 d-block">Số điện thoại</label>
                                        <div className="d-flex align-items-center p-3 rounded-3 bg-light">
                                            <FaPhoneAlt className="text-warning me-3" />
                                            <span className="fw-medium">{userInfo.phone}</span>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="mb-4">
                                    <label className="text-muted small fw-bold mb-1 d-block">Địa chỉ Email</label>
                                    <div className="d-flex align-items-center p-3 rounded-3 bg-light">
                                        <FaEnvelope className="text-warning me-3" />
                                        <span className="fw-medium">{userInfo.email}</span>
                                    </div>
                                </div>

                                <div className="mt-5 p-4 rounded-4 border border-dashed text-center bg-light-subtle">
                                    <h6 className="fw-bold mb-2">Bảo mật tài khoản</h6>
                                    <p className="text-muted small mb-3">Bạn nên thay đổi mật khẩu định kỳ để bảo vệ thông tin cá nhân của mình.</p>
                                    <Button variant="dark" className="rounded-pill px-4 shadow-sm" onClick={() => setShowPasswordModal(true)}>
                                        <FaLock className="me-2 text-warning" /> Thay đổi mật khẩu ngay
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* --- Modals --- */}
            {/* Modal Profile */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered contentClassName="border-0 shadow rounded-4">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-bold">Cập nhật hồ sơ</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleProfileUpdate}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Họ và Tên</Form.Label>
                            <Form.Control className="p-3 bg-light border-0 rounded-3" value={editProfileForm.fullName}
                                onChange={(e) => setEditProfileForm({...editProfileForm, fullName: e.target.value})} required />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Số điện thoại</Form.Label>
                            <Form.Control className="p-3 bg-light border-0 rounded-3" value={editProfileForm.phone}
                                onChange={(e) => setEditProfileForm({...editProfileForm, phone: e.target.value})} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-4 pt-0">
                        <Button variant="light" className="rounded-pill px-4" onClick={() => setShowProfileModal(false)}>Hủy</Button>
                        <Button variant="warning" type="submit" className="rounded-pill px-4 fw-bold" disabled={loading}>
                            {loading ? <Spinner size="sm" /> : "Lưu thay đổi"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Password */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered contentClassName="border-0 shadow rounded-4">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-bold">Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePasswordChange}>
                    <Modal.Body className="p-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Mật khẩu hiện tại</Form.Label>
                            <Form.Control type="password" required className="p-3 bg-light border-0 rounded-3" 
                                onChange={(e) => setNewPassword({...newPassword, current: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Mật khẩu mới</Form.Label>
                            <Form.Control type="password" required className="p-3 bg-light border-0 rounded-3"
                                onChange={(e) => setNewPassword({...newPassword, new: e.target.value})} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Xác nhận mật khẩu mới</Form.Label>
                            <Form.Control type="password" required className="p-3 bg-light border-0 rounded-3"
                                onChange={(e) => setNewPassword({...newPassword, confirm: e.target.value})} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-4 pt-0">
                        <Button variant="light" className="rounded-pill px-4" onClick={() => setShowPasswordModal(false)}>Hủy</Button>
                        <Button variant="dark" type="submit" className="rounded-pill px-4 fw-bold text-warning" disabled={loading}>
                            {loading ? <Spinner size="sm" /> : "Xác nhận"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;