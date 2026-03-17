import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Table, 
    Spinner, 
    Alert, 
    Button, 
    Badge, 
    Modal, 
    Form 
} from 'react-bootstrap'; 
import api from '../api/apiConfig'; 

const ALLOWED_ROLES = ['ADMIN', 'MANAGER']; 
const STATUS_OPTIONS = ['active', 'inactive', 'blocked'];

function CreateCustomerModal({ show, handleClose, handleCreate }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [validationError, setValidationError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setValidationError('');
    };

    const handleInternalCreate = (e) => {
        e.preventDefault();
        
        const { fullName, email, phone, password, confirmPassword } = formData;

        // 1. Check required fields
        if (!fullName || !email || !password || !confirmPassword) {
            setValidationError('Vui lòng điền đầy đủ Tên, Email, Mật khẩu và Xác nhận Mật khẩu.');
            return;
        }

        // 2. Password match check
        if (password !== confirmPassword) {
            setValidationError('Mật khẩu và Xác nhận Mật khẩu không khớp.');
            return;
        }
        
        // 3. Email format check
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            setValidationError('Email không hợp lệ.');
            return;
        }

        // 4. Password format check (chỉ cần 6 ký tự số)
        if (!/^\d{6}$/.test(password)) {
             setValidationError('Mật khẩu phải là 6 ký tự số.');
             return;
        }

        handleCreate({ fullName, email, phone, password });

        // Reset form và validation sau khi gọi API
        setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
        setValidationError('');
    };
    
    useEffect(() => {
        if (!show) {
            setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
            setValidationError('');
        }
    }, [show]);

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>➕ Thêm Khách hàng Mới</Modal.Title>
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
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại (tùy chọn)"
                        />
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
                <Button variant="primary" onClick={handleInternalCreate}>
                    Tạo Tài Khoản
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function EditCustomerModal({ show, handleClose, customer, statusOptions, handleSaveDetailsAndStatus }) {
    const [formData, setFormData] = useState({
        fullName: customer?.fullName || '',
        phone: customer?.phone || '',
        status: customer?.status || STATUS_OPTIONS[0]
    });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (customer) {
            setFormData({
                fullName: customer.fullName || '',
                phone: customer.phone || '',
                status: customer.status || STATUS_OPTIONS[0]
            });
        }
        setValidationError('');
    }, [customer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setValidationError('');
    };

    const handleInternalSave = (e) => {
        e.preventDefault();
        
        if (!formData.fullName.trim()) {
            setValidationError('Tên đầy đủ không được để trống.');
            return;
        }

        if (customer) {
            // Chỉ gửi những gì cần thiết: customerId, fullName, phone, status
            handleSaveDetailsAndStatus(customer.id, formData.fullName, formData.phone, formData.status);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>✍️ Chỉnh sửa Khách hàng: {customer?.fullName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {customer && (
                    <Form onSubmit={handleInternalSave}>
                        {validationError && <Alert variant="danger">{validationError}</Alert>}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>ID</Form.Label>
                            <Form.Control type="text" value={customer.id} disabled />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="text" value={customer.email} disabled />
                        </Form.Group>
                        
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
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái (Status)</Form.Label>
                            <Form.Select 
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status.toUpperCase()}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleInternalSave}>
                    Lưu Tất Cả Thay Đổi
                </Button>
            </Modal.Footer>
        </Modal>
    );
}


// =================================================================================
// MAIN COMPONENT: CustomerManagement
// =================================================================================

function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUserRole = localStorage.getItem('userRole'); 
    
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false); 
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        if (!ALLOWED_ROLES.includes(currentUserRole)) {
            setError('Bạn không có quyền truy cập trang Quản lý Tài khoản Khách hàng.');
            setLoading(false);
            return;
        }
        fetchCustomers();
    }, [currentUserRole]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/customers'); 
            setCustomers(response?.data || response || []); 
            setError(null);
        } catch (err) {
            console.error("Lỗi khi tải danh sách khách hàng:", err);
            setError('Không thể tải danh sách khách hàng. Lỗi API hoặc quyền truy cập.');
        } finally {
            setLoading(false);
        }
    };

    const canPerformAction = () => {
        return ALLOWED_ROLES.includes(currentUserRole);
    };

    // --- Modal Handlers ---
    const handleShowEditModal = (customer) => {
        if (canPerformAction()) {
            setSelectedCustomer(customer);
            setShowEditModal(true);
        } else {
            alert("Bạn không có quyền chỉnh sửa.");
        }
    };

    const handleShowCreateModal = () => {
        if (canPerformAction()) {
            setShowCreateModal(true);
        } else {
            alert("Bạn không có quyền thêm mới.");
        }
    };

    const handleCloseAllModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedCustomer(null);
    };
    

    const handleCreateCustomer = async ({ fullName, email, phone, password }) => {
        try {
            await api.post('/customers', { fullName, email, phone, password });
            
            alert(`Tạo tài khoản ${fullName} thành công!`);
            handleCloseAllModals();
            fetchCustomers(); 
        } catch (err) {
            const errorMessage = err.response && err.response.data 
                                ? typeof err.response.data === 'string' ? err.response.data : "Lỗi server hoặc email đã tồn tại."
                                : "Lỗi không xác định khi tạo khách hàng.";
            alert(`Lỗi khi tạo khách hàng: ${errorMessage}`);
        }
    };

    // --- CRUD Logic (EDIT Details + Status) ---
    const handleSaveDetailsAndStatus = async (customerId, fullName, phone, status) => {
        try {
            await api.put(`/customers/${customerId}`, { fullName, phone });
            
            if (selectedCustomer.status !== status) {
                 await api.put(`/customers/${customerId}/status`, { newStatus: status });
            }
            
            alert(`Cập nhật thông tin và trạng thái cho ID ${customerId} thành công!`);
            handleCloseAllModals();
            fetchCustomers(); 
        } catch (err) {
            const errorMessage = err.response && err.response.data 
                                ? typeof err.response.data === 'string' ? err.response.data : "Lỗi server hoặc không có quyền truy cập."
                                : "Lỗi không xác định khi cập nhật.";
            alert(`Lỗi khi cập nhật: ${errorMessage}`);
            fetchCustomers(); 
        }
    };

    // --- CRUD Logic (DELETE) ---
    const handleDeleteCustomer = async (customerId, fullName) => {
        if (!canPerformAction()) {
            alert("Bạn không có quyền xóa khách hàng.");
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản khách hàng: ${fullName} (ID: ${customerId})?`)) {
            try {
                // API call: DELETE /api/customer/{id}
                await api.delete(`/customers/${customerId}`); 
                alert(`Xóa khách hàng ${fullName} thành công!`);
                fetchCustomers();
            } catch (err) {
                const errorMessage = err.response && err.response.data 
                                        ? typeof err.response.data === 'string' ? err.response.data : "Lỗi server hoặc không có quyền truy cập."
                                        : "Lỗi không xác định khi xóa khách hàng.";
                alert(`Lỗi khi xóa khách hàng: ${errorMessage}`);
            }
        }
    };
    
    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'success';
            case 'inactive': return 'secondary';
            case 'blocked': return 'danger';
            default: return 'light';
        }
    }

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
                <p className="mt-3">Đang tải danh sách tài khoản khách hàng...</p>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Row className="mb-4 justify-content-center"> 
                <Col md={10} className="text-center"> 
                    <h2 className="text-info display-6 fw-bold">🧑‍🤝‍🧑 Quản lý Tài khoản Khách hàng</h2>
                    <p className="lead">
                        Quyền hạn hiện tại của bạn: <Badge bg="dark" className="fs-6">{currentUserRole}</Badge>
                    </p>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" className="mb-4">
                    <Alert.Heading>Lỗi Truy Cập</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            )}

            {!error && (
                <Row className="mb-3">
                    <Col className="d-flex justify-content-between">
            
                        <Button 
                            variant="primary" 
                            onClick={handleShowCreateModal} 
                            disabled={!canPerformAction()}
                        >
                            <i className="bi bi-person-plus-fill me-2"></i> Thêm Khách hàng Mới
                        </Button>
                        <Button variant="outline-primary" onClick={fetchCustomers}>
                            <i className="bi bi-arrow-clockwise me-2"></i> Tải lại danh sách
                        </Button>
                    </Col>
                </Row>
            )}

            {!error && customers.length === 0 && (
                <Alert variant="info" className="text-center">
                    <p className="mb-0">Danh sách khách hàng trống.</p>
                </Alert>
            )}

            {!error && customers.length > 0 && (
                <div className="table-responsive">
                    <Table striped bordered hover className="align-middle shadow-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Họ và Tên</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th style={{width: '120px'}}>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th style={{width: '150px'}} className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers?.map((customer) => { 
                                const editable = canPerformAction(); 

                                return (
                                    <tr key={customer.id}>
                                        <td>{customer.id}</td>
                                        <td>{customer.fullName}</td>
                                        <td>{customer.email}</td>
                                        <td>{customer.phone || '(Chưa có SĐT)'}</td>
                                        <td>
                                            <Badge 
                                                bg={getStatusVariant(customer.status)} 
                                                className="py-2 px-3"
                                            >
                                                {customer.status?.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        <td className="text-center">
                                            {editable && (
                                                <>
                                                    {/* Nút Sửa Gộp (TT + Status) */}
                                                    <Button 
                                                        variant="warning" 
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleShowEditModal(customer)}
                                                        title="Sửa thông tin và trạng thái"
                                                    >
                                                        <i className="bi bi-pencil-fill"></i> Sửa
                                                    </Button>
                                                    
                                                    {/* Nút Xóa */}
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteCustomer(customer.id, customer.fullName)}
                                                        title="Xóa Khách hàng"
                                                    >
                                                        <i className="bi bi-trash-fill"></i> Xóa
                                                    </Button>
                                                </>
                                            )}
                                            {!editable && (
                                                <Badge bg="secondary">Không có quyền</Badge>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            )}
            
            {/* 1. Modal Thêm Khách hàng Mới */}
            <CreateCustomerModal 
                show={showCreateModal}
                handleClose={handleCloseAllModals}
                handleCreate={handleCreateCustomer}
            />

            {/* 2. Modal Sửa thông tin (Tên, SĐT và Trạng thái) */}
            {selectedCustomer && (
                <EditCustomerModal 
                    show={showEditModal}
                    handleClose={handleCloseAllModals}
                    customer={selectedCustomer}
                    statusOptions={STATUS_OPTIONS}
                    handleSaveDetailsAndStatus={handleSaveDetailsAndStatus}
                />
            )}
        </Container>
    );
}

export default CustomerManagement;
