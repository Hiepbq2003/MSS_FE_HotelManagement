import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Table, 
    Spinner, 
    Alert, 
    Button, 
    Form, 
    Badge,
    Modal 
} from 'react-bootstrap'; 
import api from '../api/apiConfig'; 

// --- Constants ---
const ALLOWED_ACCESS_ROLES = ['ADMIN']; 
const ALL_STAFF_ROLES = ['ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING'];
const ALL_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'BLOCKED'];

// --- Helper Functions for UI ---

const getRoleVariant = (role) => {
    switch (role) {
        case 'ADMIN': return 'danger';
        case 'MANAGER': return 'warning';
        case 'RECEPTION': return 'info';
        case 'HOUSEKEEPING': return 'primary';
        default: return 'secondary';
    }
}

const getStatusVariant = (status) => {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'INACTIVE': return 'secondary';
        case 'BLOCKED': return 'danger';
        default: return 'secondary';
    }
}

const getErrorMessage = (err) => {
    if (err.response && err.response.data) {
        // Kiểm tra nếu body là string (thường là lỗi IllegalArgumentException)
        if (typeof err.response.data === 'string') {
            // Cắt bớt stacktrace nếu quá dài
            return err.response.data.substring(0, 200) + (err.response.data.length > 200 ? '...' : '');
        }
        // Nếu là JSON (thường là lỗi validation 400 hoặc cấu trúc lỗi khác)
        if (typeof err.response.data === 'object' && err.response.data.message) {
            return err.response.data.message;
        }
        // Nếu là JSON từ API reset pass mới
        if (typeof err.response.data === 'object' && err.response.data.error) {
            return err.response.data.error;
        }
        // Nếu là string lỗi không xác định
        if (typeof err.response.data === 'string') {
            return err.response.data;
        }
    }
    return "Lỗi không xác định hoặc lỗi kết nối mạng.";
};

function CreateUserModal({ show, handleClose, handleCreate, editableRoles }) {
    const initialRole = editableRoles.length > 0 ? editableRoles[0] : 'RECEPTION';
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: initialRole
    });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (show) {
     
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                role: editableRoles.length > 0 ? editableRoles[0] : 'RECEPTION'
            });
            setValidationError('');
        }
    }, [show, editableRoles]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setValidationError('');
    };

    const handleInternalCreate = (e) => {
        e.preventDefault();
        
        const { fullName, email, password, confirmPassword, role, phone } = formData;

        if (!fullName || !email || !password || !confirmPassword || !role) {
            setValidationError('Vui lòng điền đầy đủ Tên, Email, Mật khẩu và Vai trò.');
            return;
        }

        if (password !== confirmPassword) {
            setValidationError('Mật khẩu và Xác nhận Mật khẩu không khớp.');
            return;
        }
        
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            setValidationError('Email không hợp lệ.');
            return;
        }

        if (!/^\d{6}$/.test(password)) {
             setValidationError('Mật khẩu phải là 6 ký tự số.');
             return;
        }

        const username = email.split('@')[0];

        handleCreate({ 
            fullName, 
            email, 
            username, 
            password, 
            role: role, 
            phone,
            hotelId: null
        });
        
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>➕ Thêm Tài khoản Nhân viên</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleInternalCreate}>
                    {validationError && <Alert variant="danger">{validationError}</Alert>}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Họ và Tên (*)</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Email (*)</Form.Label>
                        <Form.Control 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Nhập email"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vai trò (*)</Form.Label>
                        <Form.Select 
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            {editableRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mật khẩu (6 ký tự số) (*)</Form.Label>
                        <Form.Control 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu (6 số)"
                            maxLength={6}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Xác nhận Mật khẩu (*)</Form.Label>
                        <Form.Control 
                            type="password" 
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Xác nhận mật khẩu (6 số)"
                            maxLength={6}
                            required
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="success" onClick={handleInternalCreate}>
                    Tạo Tài Khoản
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function EditUserModal({ show, handleClose, user, handleSave, editableRoles }) {

    const isTargetUserAdmin = user?.role === 'ADMIN'; 
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        role: user?.role || 'RECEPTION',
        status: user?.status || 'ACTIVE' 
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {

            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                role: user.role || 'RECEPTION',
                status: user.status || 'ACTIVE' 
            });
            setError('');
        }
    }, [user, show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleInternalSave = () => {
        if (!formData.fullName || formData.fullName.trim() === '') {
            setError('Họ và Tên không được để trống.');
            return;
        }
        
        const updatedFields = {
            fullName: formData.fullName,
            phone: formData.phone,
            role: formData.role, 
            status: formData.status 
        };
        
        handleSave(user.id, updatedFields, user); 
        handleClose();
    };
    
    const originalDetailsMatch = (user, formData) => {
       
        return user.fullName === formData.fullName && user.phone === formData.phone;
    }

    if (!user) return null;

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton className="bg-warning text-dark">
                <Modal.Title>✏️ Chỉnh sửa Nhân viên: {user.fullName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                {isTargetUserAdmin && (
                    <Alert variant="info">
                        Đây là tài khoản Quản trị viên (ADMIN). **Vai trò và Trạng thái không thể thay đổi** để bảo đảm an ninh hệ thống.
                    </Alert>
                )}
                
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Họ và Tên</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vai trò</Form.Label>
                        <Form.Select 
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={isTargetUserAdmin} // Vô hiệu hóa nếu là Admin
                        >
                            {isTargetUserAdmin ? (
                                <option value="ADMIN">ADMIN</option>
                            ) : (
                                editableRoles.filter(r => r !== 'ADMIN').map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))
                            )}
                        </Form.Select>
                        {isTargetUserAdmin && <Form.Text className="text-muted">Không thể thay đổi vai trò của tài khoản Admin.</Form.Text>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Trạng thái</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={isTargetUserAdmin} // Vô hiệu hóa nếu là Admin
                        >
                            {ALL_STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </Form.Select>
                        {isTargetUserAdmin && <Form.Text className="text-muted">Không thể thay đổi trạng thái của tài khoản Admin.</Form.Text>}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Hủy
                </Button>
                <Button 
                    variant="warning" 
                    onClick={handleInternalSave}
          
                    disabled={!user || (isTargetUserAdmin && originalDetailsMatch(user, formData))}
                >
                    Lưu Thay Đổi
                </Button>
            </Modal.Footer>
        </Modal>
    );
}


// =================================================================================
// MAIN COMPONENT: UserManagement
// =================================================================================

function UserManagement() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const currentUserRole = localStorage.getItem('userRole') ? localStorage.getItem('userRole').toUpperCase() : '';
    const currentUserId = localStorage.getItem('userId');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (!ALLOWED_ACCESS_ROLES.includes(currentUserRole)) {
            setError('Bạn không có quyền truy cập trang Quản lý Người dùng. Chỉ Admin mới được truy cập.');
            setLoading(false);
            return;
        }
        fetchUsers();
    }, [currentUserRole]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            
            const response = await api.get('/user/staff'); 
            
            const data = Array.isArray(response) ? response : [];
            
            const processedUsers = data.map(user => ({
                ...user,
  
                role: user.role ? user.role.toUpperCase() : 'UNKNOWN', 
                status: user.status ? user.status.toUpperCase() : 'UNKNOWN'
            }));

            setUsers(processedUsers); 
            setError(null);
        } catch (err) {
            console.error("Lỗi tải người dùng:", err);
            const errorMessage = getErrorMessage(err);
            setError(`Không thể tải danh sách người dùng. ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };
    
    const isCurrentUserAdmin = currentUserRole === 'ADMIN';

    const canEdit = (targetUserRole, targetUserId) => {
        if (!isCurrentUserAdmin) return false;
    
        return targetUserRole !== 'ADMIN';
    };
    
    const getEditableRoles = () => {
        if (isCurrentUserAdmin) {
     
            return ALL_STAFF_ROLES.filter(role => role !== 'ADMIN');
        }
        return [];
    };

    const handleCreateUser = async (formData) => {
        setShowCreateModal(false);

        // 1. Lấy role từ form và viết hoa toàn bộ
        let inputRole = formData.role ? formData.role.toUpperCase() : 'RECEPTION';
        let correctRole = '';

        // 2. Map chính xác 100% từ Frontend sang Java Enum ở Backend
        switch (inputRole) {
            case 'RECEPTION':
                correctRole = 'RECEPTIONIST';
                break;
            case 'HOUSEKEEPING':
                correctRole = 'HOUSEKEEPING';
                break;
            case 'MANAGER':
                correctRole = 'MANAGER';
                break;
            case 'ADMIN':
                correctRole = 'ADMIN';
                break;
            default:
                correctRole = 'RECEPTIONIST';
        }

        const payload = {
            ...formData,
            role: correctRole 
        };

        try {
            await api.post('/user', payload);
            
            alert(`Tạo tài khoản nhân viên ${formData.fullName} thành công!`);
            fetchUsers(); 
        } catch (err) {
            console.error("Lỗi tạo người dùng:", err);
   
            const errorMessage = getErrorMessage(err);
            alert(`Lỗi khi tạo người dùng: ${errorMessage}`);
        }
    };
    
    const handleEditDetails = async (userId, updatedFields, originalUser) => {
        
        
        const roleToSend = updatedFields.role ? updatedFields.role.toLowerCase() : originalUser.role.toLowerCase();
     
        const detailUpdatePayload = {
        
            username: originalUser.username,
            email: originalUser.email, 
            
            fullName: updatedFields.fullName,
            phone: updatedFields.phone,
            role: roleToSend,
            
            
            password: originalUser.password || '******',
            hotelId: originalUser.hotelId || null, 
        };

        try {
            let updateStatus = false;
            
            await api.put(`/user/${userId}/details`, detailUpdatePayload);
            
            // 2. CẬP NHẬT TRẠNG THÁI (PUT /user/{userId}/status) - TÁCH RIÊNG
            // Nếu trạng thái thay đổi
            if (originalUser.status !== updatedFields.status && originalUser.role !== 'ADMIN') {
                updateStatus = true;
                // Trạng thái được chọn trong form là 'ACTIVE', 'INACTIVE', 'BLOCKED' (chữ hoa)
                const statusPayload = { newStatus: updatedFields.status.toUpperCase() }; 
                await api.put(`/user/${userId}/status`, statusPayload);
            }

            alert(`Cập nhật thông tin người dùng ID ${userId} thành công!${updateStatus ? " (Bao gồm cập nhật trạng thái)" : ""}`);
            fetchUsers();
        } catch (err) {
            console.error("❌ Lỗi cập nhật chi tiết:", err);
            // Cố gắng lấy lỗi chi tiết từ body response
            const errorMessage = getErrorMessage(err);
            alert(`Lỗi khi cập nhật chi tiết: ${errorMessage}`);
        }
    };

    // NEW HANDLER: Reset Password Logic
    const handleResetPassword = async (userId, userFullName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn ĐẶT LẠI MẬT KHẨU cho nhân viên: ${userFullName} (ID: ${userId}) không? Mật khẩu sẽ được đặt lại về mặc định "123456".`)) {
            return;
        }

        try {
            // Call Backend API: PUT /api/user/{userId}/reset-password
            const response = await api.put(`/user/${userId}/reset-password`);
            
            // Lấy thông báo từ response body (đã được cấu hình ở BE)
            alert(response.data.message || `Đặt lại mật khẩu cho ${userFullName} thành công! Mật khẩu mặc định: 123456.`);
            fetchUsers();
        } catch (err) {
            console.error("❌ Lỗi reset mật khẩu:", err);
            const errorMessage = getErrorMessage(err);
            alert(`Lỗi khi đặt lại mật khẩu: ${errorMessage}`);
        }
    };
    
    // --- Render Logic ---
    const editableRoles = getEditableRoles();

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
                <p className="mt-3">Đang tải danh sách người dùng...</p>
            </Container>
        );
    }

    return (
        
        <Container className="my-5">

            <Row className="mb-4 justify-content-center"> 
                <Col md={10} className="text-center"> 
                    <h2 className="text-primary display-6 fw-bold">👨‍💼 Quản lý Tài khoản Nhân viên</h2>
                    <p className="lead">
                        Quyền hạn hiện tại của bạn: <Badge bg={getRoleVariant(currentUserRole)} className="fs-6">{currentUserRole}</Badge>
                    </p>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" className="mb-4">
                    <Alert.Heading>Lỗi Truy Cập/Tải Dữ Liệu</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {!error && isCurrentUserAdmin && (
                <Row className="mb-3">
                    <Col className="d-flex justify-content-start">
                        {/* Nút Thêm Mới */}
                        <Button 
                            variant="success" 
                            onClick={() => setShowCreateModal(true)} 
                            disabled={editableRoles.length === 0}
                        >
                            <i className="bi bi-person-plus-fill me-2"></i> Thêm Nhân viên Mới
                        </Button>
                        <Button variant="outline-primary" onClick={fetchUsers} className="ms-2">
                            <i className="bi bi-arrow-clockwise me-2"></i> Tải lại danh sách
                        </Button>
                    </Col>
                </Row>
            )}
            
            {!error && !isCurrentUserAdmin && (
                <Alert variant="warning" className="text-center">
                    Bạn không có quyền thực hiện các thao tác quản lý.
                </Alert>
            )}

            {!error && users.length > 0 && (
                <div className="table-responsive">
                    <Table striped bordered hover className="align-middle shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Họ và Tên</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th> {/* Cột Trạng thái */}
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                // Kiểm tra quyền chỉnh sửa (Admin, không phải tài khoản Admin khác)
                                const editable = canEdit(user.role, user.id); 
                                
                                return (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <Badge bg={getRoleVariant(user.role)} className="py-2 px-3">{user.role}</Badge>
                                        </td>
                                        <td>
                                            <Badge bg={getStatusVariant(user.status)} className="py-2 px-3">{user.status}</Badge>
                                        </td>
                                        <td className="text-center">
                                            {isCurrentUserAdmin ? (
                                                <>
                                                    <Button 
                                                        variant="warning" 
                                                        size="sm"
                                                        className="me-2 text-white"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowEditModal(true);
                                                        }}
                                                        title={editable ? "Chỉnh sửa Tên, Vai trò và Trạng thái" : "Không thể sửa Admin"}
                                                        disabled={!editable} // Disable nếu là tài khoản Admin
                                                    >
                                                        <i className="bi bi-pencil-square"></i> Edit
                                                    </Button>
                                                    
                                                    {/* NEW RESET PASSWORD BUTTON */}
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleResetPassword(user.id, user.fullName)}
                                                        title={editable ? "Reset mật khẩu về 123456" : "Không thể reset mật khẩu Admin"}
                                                        disabled={!editable} // Disable nếu là tài khoản Admin
                                                    >
                                                        <i className="bi bi-key-fill"></i> Reset Pass
                                                    </Button>
                                                </>
                                            ) : (
                                                <Badge bg="secondary">Không thể sửa</Badge>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            )}
            
            {/* Modal Thêm Nhân viên Mới */}
            <CreateUserModal 
                show={showCreateModal}
                handleClose={() => setShowCreateModal(false)}
                handleCreate={handleCreateUser}
                editableRoles={editableRoles}
            />
            
            {/* Modal Chỉnh sửa Chi tiết (Tên, Role, Status) */}
            <EditUserModal
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                user={selectedUser}
                handleSave={handleEditDetails}
                editableRoles={ALL_STAFF_ROLES} // Cung cấp tất cả các role có thể chỉnh sửa
            />

        </Container>
    );
}

export default UserManagement;