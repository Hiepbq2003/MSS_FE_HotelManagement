import React, { useEffect, useState } from "react";
// Thêm Pagination cho chức năng phân trang
import { Table, Button, Modal, Form, Spinner, Alert, Pagination } from "react-bootstrap"; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/apiConfig"; 

// Cấu hình cố định cho Khách sạn đơn lẻ (ID=1)
const DEFAULT_HOTEL_ID = 1; 
const ALLOWED_ROLES = ['MANAGER']; 

const ServiceManagement = () => {
    
    // Lấy vai trò người dùng hiện tại
    const currentUserRole = localStorage.getItem('userRole');
    // Cờ kiểm tra quyền quản lý (để ẩn/hiện nút)
    const canManageServices = ALLOWED_ROLES.includes(currentUserRole);

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // START: New states for Search and Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [servicesPerPage] = useState(10); // Số lượng dịch vụ trên mỗi trang
    // END: New states for Search and Pagination
    
    // State cho Service
    const [currentService, setCurrentService] = useState({
        id: null,
        code: "",
        name: "",
        description: "",
        price: "", 
    });

    // Hàm định dạng giá tiền (VND)
    const formatPrice = (price) => {
        if (price === null || price === undefined) return '';
        const numberPrice = parseFloat(price);
        if (isNaN(numberPrice)) return '';
        // Định dạng tiền tệ Việt Nam (₫)
        return numberPrice.toLocaleString("vi-VN") + " ₫";
    };

    // Hàm tải danh sách dịch vụ
    const fetchServices = async () => {
        if (!canManageServices || (error && error.includes('không có quyền truy cập'))) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            // Lấy toàn bộ danh sách Services từ Backend
            const response = await api.get("/services");
            const data = response; 
            
            // ✅ ĐÃ SỬA: Bỏ logic lọc ở FE, tin tưởng Backend chỉ trả về data của Hotel ID=1
            setServices(Array.isArray(data) ? data : []);

        } catch (err) {
            setError("Không thể tải danh sách Dịch vụ. Vui lòng kiểm tra Server.");
            console.error("Fetch Services Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Kiểm tra quyền truy cập cấp trang
        if (!ALLOWED_ROLES.includes(currentUserRole)) {
            setError('Bạn không có quyền truy cập trang Quản lý Dịch vụ. Yêu cầu vai trò MANAGER.');
            setLoading(false);
            return;
        }
        fetchServices();
    }, [currentUserRole]); 

    // Mở Modal
    const openModal = (service = null) => {
        if (service) {
            setIsEditing(true);
            setCurrentService({
                ...service,
                // Chuyển giá trị sang string để hiển thị trong input number
                price: service.price?.toString() || "" 
            });
        } else {
            setIsEditing(false);
            setCurrentService({
                id: null, code: "", name: "", description: "", price: ""
            });
        }
        setError(null);
        setShowModal(true);
    };

    // Đóng Modal
    const closeModal = () => {
        setShowModal(false);
        setError(null); 
    };


    // Xử lý Gửi form (Thêm mới/Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!canManageServices) {
            toast.error("Bạn không có quyền thực hiện thao tác này.");
            return;
        }
        
        // Validation cơ bản
        if (!currentService.code || !currentService.name || currentService.price === "") {
            setError("Mã dịch vụ, Tên dịch vụ và Giá là bắt buộc!");
            toast.error("Vui lòng nhập đủ thông tin bắt buộc.");
            return;
        }
        const priceValue = parseFloat(currentService.price);
        if (isNaN(priceValue) || priceValue < 0) {
            setError("Giá (Price) phải là một số không âm!");
            toast.error("Vui lòng nhập Giá hợp lệ.");
            return;
        }


        try {
            const dataToSend = {
                ...currentService,
                price: priceValue,
                // Gán cố định hotel id = 1
                hotel: { id: DEFAULT_HOTEL_ID } 
            };
            
            // Loại bỏ ID nếu là thao tác thêm mới
            if (!isEditing) delete dataToSend.id; 

            if (isEditing) {
                await api.put(`/service/${dataToSend.id}`, dataToSend);
                toast.success("✅ Cập nhật dịch vụ thành công!");
            } else {
                await api.post("/service", dataToSend);
                toast.success("➕ Thêm mới dịch vụ thành công!");
            }
            closeModal();
            fetchServices();
        } catch (err) {
            console.error("Chi tiết lỗi API:", err); 
            let errorMessage = "Lỗi không xác định. Vui lòng kiểm tra Console/Server.";
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message; 
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            toast.error(`❌ Lỗi khi lưu: ${errorMessage}`);
            setError(`Lỗi khi lưu: ${errorMessage}`);
        }
    };

    // Xử lý Xóa dịch vụ
    const handleDelete = async (id, name) => {
        if (!canManageServices) {
            toast.error("Bạn không có quyền thực hiện thao tác này.");
            return;
        }

        // Thay window.confirm bằng Modal tùy chỉnh nếu cần, theo hướng dẫn chung
        if (!window.confirm(`Bạn có chắc muốn xóa dịch vụ "${name}" này?`)) return;
        
        try {
            await api.delete(`/service/${id}`);
            toast.info(`🗑️ Đã xóa dịch vụ "${name}" thành công!`);
            fetchServices();
        } catch (err) {
            const errorMessage = err.message || "Không thể xóa.";
            toast.error(`❌ Lỗi khi xóa: ${errorMessage}`);
        }
    };
    
    // START: Logic for Search and Pagination
    // 1. Logic cho Tìm kiếm (Lọc Services)
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Logic cho Phân trang (Tính toán dịch vụ trên trang hiện tại)
    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

    // Tính toán tổng số trang
    const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

    // Hàm chuyển trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    // Xử lý thay đổi Search Term (Đồng thời reset trang về 1)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    };
    // END: Logic for Search and Pagination

    // Hiển thị lỗi quyền truy cập cấp trang
    if (!canManageServices) {
        return <p className="text-danger text-center mt-5 p-4 bg-light rounded shadow-sm" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
            Lỗi: Bạn không có quyền truy cập trang Quản lý Dịch vụ. Yêu cầu vai trò MANAGER.
        </p>;
    }


    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-primary">Đang tải dữ liệu Dịch vụ...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <h3 className="mb-4 text-center text-secondary border-bottom pb-2" style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                {/* Tiêu đề được thiết kế lại */}
                🛎️ QUẢN LÝ TIỆN ÍCH
            </h3>

            {error && !showModal && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            {/* START: Nút Thêm mới và Ô Tìm kiếm */}
            <div className="d-flex justify-content-between align-items-center mb-3"> 
                {canManageServices && (
                    <Button variant="success" 
                            className="shadow-lg btn-lg" 
                            onClick={() => openModal()}
                            style={{ background: '#28a745', borderColor: '#28a745', fontWeight: 600 }}
                    >
                        ➕ THÊM DỊCH VỤ MỚI
                    </Button>
                )}
                
                <Form className="d-flex w-50"> 
                    <Form.Control
                        type="search"
                        placeholder="Tìm kiếm theo Mã/Tên/Mô tả..."
                        className="me-2"
                        aria-label="Search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </Form>
            </div>
            {/* END: Nút Thêm mới và Ô Tìm kiếm */}


            {/* Bảng dữ liệu được thiết kế lại */}
            <div className="shadow-2xl rounded-xl table-responsive bg-white p-3 border border-gray-200">
                <Table striped bordered hover className="m-0 align-middle caption-top"> 
                    <caption className="text-primary fw-bold mb-2">
                        Danh sách Dịch vụ đang hoạt động (Khách sạn ID: {DEFAULT_HOTEL_ID})
                    </caption>
                    <thead className="table-dark shadow-md">
                        <tr style={{ backgroundColor: '#007bff' }}>
                            <th className="text-center" style={{ width: '5%' }}>ID</th>
                            <th style={{ width: '10%' }}>Mã DV</th>
                            <th style={{ width: '20%' }}>Tên Dịch vụ</th>
                            <th className="text-end" style={{ width: '15%' }}>Giá (VND)</th>
                            <th style={{ width: '35%' }}>Mô tả</th>
                            <th className="text-center" style={{ width: '10%' }}>Ngày tạo</th>
                            {canManageServices && <th className="text-center" style={{ width: '15%' }}>Hành động</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {/* SỬ DỤNG currentServices THAY VÌ services */}
                        {currentServices.length > 0 ? (
                            currentServices.map((service, index) => (
                                <tr key={service.id} className={index % 2 === 0 ? 'bg-light' : 'bg-white'}>
                                    <td className="text-center text-muted fw-light">{service.id}</td>
                                    <td className="fw-bold text-uppercase text-primary">{service.code}</td>
                                    <td>{service.name}</td>
                                    <td className="text-end fw-bold text-success">{formatPrice(service.price)}</td>
                                    <td>
                                        {/* Hiển thị tóm tắt, dùng title để xem đầy đủ */}
                                        <span title={service.description}>
                                            {service.description?.substring(0, 70) + (service.description?.length > 70 ? '...' : '')}
                                        </span>
                                    </td>
                                    <td className="text-center text-secondary small">
                                        {new Date(service.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    {canManageServices && (
                                        <td className="text-center text-nowrap">
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2 text-white shadow-sm hover:shadow-md transition duration-200"
                                                onClick={() => openModal(service)}
                                            >
                                                ✏️ Sửa
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="shadow-sm hover:shadow-md transition duration-200"
                                                onClick={() => handleDelete(service.id, service.name)}
                                            >
                                                🗑️ Xóa
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={canManageServices ? "7" : "6"} className="text-center py-5 text-secondary">
                                        📋 Hiện chưa có dịch vụ nào được tìm thấy.
                                    </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* START: Pagination Component */}
            {filteredServices.length > servicesPerPage && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                        <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />

                        {/* Tạo các nút số trang */}
                        {[...Array(totalPages).keys()].map(number => (
                            <Pagination.Item 
                                key={number + 1} 
                                active={number + 1 === currentPage} 
                                onClick={() => paginate(number + 1)}
                            >
                                {number + 1}
                            </Pagination.Item>
                        ))}

                        <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}
            {/* END: Pagination Component */}

            {/* Modal Thêm/Sửa Dịch vụ */}
            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton className={isEditing ? "bg-warning text-dark" : "bg-primary text-white"}>
                    <Modal.Title>{isEditing ? "Chỉnh Sửa Dịch vụ" : "Thêm Dịch vụ mới"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Tên Dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={currentService.name}
                                onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mã dịch vụ (Code) <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={currentService.code}
                                onChange={(e) => setCurrentService({ ...currentService, code: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Giá (VND) <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="number"
                                value={currentService.price}
                                onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })}
                                required
                                min="0"
                                step="0.01" 
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={currentService.description}
                                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
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

        </div>
    );
};

export default ServiceManagement;