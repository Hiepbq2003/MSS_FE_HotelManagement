import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Spinner, Alert, Pagination } from "react-bootstrap"; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/apiConfig"; 

const DEFAULT_HOTEL_ID = 1; 
const ALLOWED_ROLES = ['MANAGER']; 

const ServiceManagement = () => {
    const currentUserRole = localStorage.getItem('userRole');
    const canManageServices = ALLOWED_ROLES.includes(currentUserRole);

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [servicesPerPage] = useState(10); 
    
    const [currentService, setCurrentService] = useState({
        id: null, code: "", name: "", description: "", price: "", 
    });

    // Hàm viết hoa chữ cái đầu cho tên dịch vụ hoặc mã
    const capitalizeFirstLetter = (string) => {
        if (!string) return "";
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    const formatPrice = (price) => {
        if (!price) return '0 ₫';
        return parseFloat(price).toLocaleString("vi-VN") + " ₫";
    };

    const fetchServices = async () => {
        if (!canManageServices) return;
        
        setLoading(true);
        setError(null);
        try {
            // Gọi đúng endpoint /api/services từ backend
            const data = await api.get("/services");
            setServices(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("Không thể tải danh sách dịch vụ. Vui lòng kiểm tra lại server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ALLOWED_ROLES.includes(currentUserRole)) {
            setError('Bạn không có quyền truy cập trang này. Yêu cầu quyền MANAGER.');
            setLoading(false);
            return;
        }
        fetchServices();
    }, [currentUserRole]); 

    const openModal = (service = null) => {
        if (service) {
            setIsEditing(true);
            setCurrentService({ 
                ...service, 
                price: service.price?.toString() || "" 
            });
        } else {
            setIsEditing(false);
            setCurrentService({ id: null, code: "", name: "", description: "", price: "" });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const priceValue = parseFloat(currentService.price);
        
        if (isNaN(priceValue) || priceValue < 0) {
            toast.error("Giá tiền không hợp lệ.");
            return;
        }

        try {
            const dataToSend = {
                code: currentService.code.toUpperCase(),
                name: currentService.name,
                description: currentService.description,
                price: priceValue,
                hotelId: DEFAULT_HOTEL_ID // Gửi ID thay vì lồng object hotel
            };

            if (isEditing) {
                // PUT /api/services/{id}
                await api.put(`/services/${currentService.id}`, dataToSend);
                toast.success("✅ Cập nhật dịch vụ thành công!");
            } else {
                // POST /api/services
                await api.post("/services", dataToSend);
                toast.success("➕ Thêm dịch vụ mới thành công!");
            }
            closeModal();
            fetchServices();
        } catch (err) {
            const msg = err.response?.data?.message || "Lỗi xử lý API";
            toast.error(`❌ ${msg}`);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${name}" không?`)) return;
        try {
            // DELETE /api/services/{id}
            await api.delete(`/services/${id}`);
            toast.info(`🗑️ Đã xóa dịch vụ "${name}".`);
            fetchServices();
        } catch (err) {
            toast.error("❌ Không thể xóa dịch vụ này.");
        }
    };
    
    // Logic tìm kiếm và phân trang
    const filteredServices = useMemo(() => {
        return services.filter(s => 
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [services, searchTerm]);

    const currentData = filteredServices.slice(
        (currentPage - 1) * servicesPerPage, 
        currentPage * servicesPerPage
    );

    const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

    if (error && !services.length) return <div className="container mt-4"><Alert variant="danger">{error}</Alert></div>;

    return (
        <div className="container mt-4">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <h3 className="mb-4 text-center text-primary" style={{ fontWeight: 'bold' }}>
                🛎️ QUẢN LÝ TIỆN ÍCH DỊCH VỤ
            </h3>

            <div className="d-flex justify-content-between mb-3 align-items-center"> 
                <Button variant="success" className="shadow-sm" onClick={() => openModal()}>
                    ➕ THÊM DỊCH VỤ MỚI
                </Button>
                <Form.Control 
                    className="w-50 shadow-sm" 
                    placeholder="Tìm kiếm theo mã hoặc tên dịch vụ..." 
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                />
            </div>

            <div className="shadow-sm rounded table-responsive">
                <Table striped bordered hover className="align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center">ID</th>
                            <th>Mã</th>
                            <th>Tên Dịch vụ</th>
                            <th className="text-end">Giá Tiền</th>
                            <th>Mô tả</th>
                            <th className="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? currentData.map((s) => (
                            <tr key={s.id}>
                                <td className="text-center text-muted">{s.id}</td>
                                <td className="fw-bold text-primary text-uppercase">{s.code}</td>
                                <td>{capitalizeFirstLetter(s.name)}</td>
                                <td className="text-end fw-bold text-success">{formatPrice(s.price)}</td>
                                <td className="small">{s.description || "Chưa có mô tả"}</td>
                                <td className="text-center">
                                    <Button variant="outline-warning" size="sm" className="me-2" onClick={() => openModal(s)}>
                                        ✏️ Sửa
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s.id, s.name)}>
                                        🗑️ Xóa
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-secondary">
                                    Không tìm thấy dịch vụ nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination className="justify-content-center mt-3">
                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                    {[...Array(totalPages)].map((_, i) => (
                        <Pagination.Item 
                            key={i + 1} 
                            active={i + 1 === currentPage} 
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            )}

            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton className={isEditing ? "bg-warning text-dark" : "bg-primary text-white"}>
                    <Modal.Title>{isEditing ? "✏️ Chỉnh Sửa Dịch vụ" : "➕ Thêm Dịch vụ Mới"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Tên Dịch vụ</Form.Label>
                            <Form.Control 
                                required 
                                placeholder="Ví dụ: Giặt là, Ăn sáng..."
                                value={currentService.name} 
                                onChange={e => setCurrentService({...currentService, name: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mã dịch vụ (Code)</Form.Label>
                            <Form.Control 
                                required 
                                placeholder="Ví dụ: LAUNDRY"
                                value={currentService.code} 
                                onChange={e => setCurrentService({...currentService, code: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Giá (VND)</Form.Label>
                            <Form.Control 
                                type="number" 
                                required 
                                min="0"
                                value={currentService.price} 
                                onChange={e => setCurrentService({...currentService, price: e.target.value})} 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mô tả</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                placeholder="Nhập mô tả chi tiết dịch vụ..."
                                value={currentService.description} 
                                onChange={e => setCurrentService({...currentService, description: e.target.value})} 
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>Hủy</Button>
                        <Button type="submit" variant={isEditing ? "warning" : "primary"}>
                            {isEditing ? "Lưu thay đổi" : "Tạo dịch vụ"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ServiceManagement;