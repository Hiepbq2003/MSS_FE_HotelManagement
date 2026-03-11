import React, { useEffect, useState, useMemo } from "react";
// Thêm Pagination cho chức năng phân trang
import { Table, Button, Modal, Form, Spinner, Alert, Pagination } from "react-bootstrap"; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/apiConfig"; 

// Cấu hình cố định cho Khách sạn đơn lẻ (ID=1)
const DEFAULT_HOTEL_ID = 1; 
const ALLOWED_ROLES = ['MANAGER']; 

// Hàm định dạng ngày tháng
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Định dạng dd/MM/yyyy HH:mm
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    } catch (e) {
        return 'N/A';
    }
};

const HotelAmenityManagement = () => {
    
    const currentUserRole = localStorage.getItem('userRole');
    const canManageAmenities = ALLOWED_ROLES.includes(currentUserRole);

    // State gốc chứa toàn bộ dữ liệu từ API
    const [allAmenities, setAllAmenities] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // State cho Search và Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [amenitiesPerPage] = useState(10); // 10 tiện ích trên mỗi trang
    
    // State cho Tiện ích (Đã cập nhật: BỎ iconUrl, isActive)
    const [currentAmenity, setCurrentAmenity] = useState({
        id: null,
        hotelId: DEFAULT_HOTEL_ID, 
        name: "",
        description: "",
    });

    // Hàm tải danh sách Tiện ích
    const fetchAmenities = async () => {
        if (!canManageAmenities || (error && error.includes('không có quyền truy cập'))) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            // Endpoint đã cấu hình ở BE: /api/hotel-amenities?hotelId=1
            const response = await api.get(`/hotel-amenities?hotelId=${DEFAULT_HOTEL_ID}`);
            const data = response; 
            setAllAmenities(Array.isArray(data) ? data : []);

        } catch (err) {
            setError("Không thể tải danh sách Tiện ích. Vui lòng kiểm tra Server.");
            console.error("Fetch Amenities Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ALLOWED_ROLES.includes(currentUserRole)) {
            setError('Bạn không có quyền truy cập trang Quản lý Tiện ích. Yêu cầu vai trò MANAGER.');
            setLoading(false);
            return;
        }
        fetchAmenities();
    }, [currentUserRole]); 

    // Logic cho Tìm kiếm và Phân trang (sử dụng useMemo để tối ưu)
    const filteredAmenities = useMemo(() => {
        // 1. Lọc/Tìm kiếm
        const filtered = allAmenities.filter(amenity =>
            amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (amenity.description && amenity.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        // Luôn reset trang về 1 khi filter/search thay đổi
        if (currentPage !== 1) setCurrentPage(1); 
        
        return filtered;
    }, [allAmenities, searchTerm]);


    // 2. Logic cho Phân trang
    const indexOfLastAmenity = currentPage * amenitiesPerPage;
    const indexOfFirstAmenity = indexOfLastAmenity - amenitiesPerPage;
    const currentAmenities = filteredAmenities.slice(indexOfFirstAmenity, indexOfLastAmenity);

    const totalPages = Math.ceil(filteredAmenities.length / amenitiesPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    // Xử lý thay đổi Search Term
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // Việc reset page đã được xử lý trong useMemo
    };

    // Mở Modal
    const openModal = (amenity = null) => {
        if (amenity) {
            setIsEditing(true);
            setCurrentAmenity({
                id: amenity.id,
                hotelId: amenity.hotelId || DEFAULT_HOTEL_ID,
                name: amenity.name,
                description: amenity.description || "",
            });
        } else {
            setIsEditing(false);
            setCurrentAmenity({
                id: null, hotelId: DEFAULT_HOTEL_ID, name: "", description: ""
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

    // Xử lý thay đổi Input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentAmenity({ ...currentAmenity, [name]: value });
    };


    // Xử lý Gửi form (Thêm mới/Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!canManageAmenities) {
            toast.error("Bạn không có quyền thực hiện thao tác này.");
            return;
        }
        
        // Validation cơ bản
        if (!currentAmenity.name) {
            setError("Tên tiện ích là bắt buộc!");
            toast.error("Vui lòng nhập đủ thông tin bắt buộc.");
            return;
        }

        try {
            // DTO gửi lên Backend (Đã cập nhật: BỎ iconUrl, isActive)
            const dataToSend = {
                hotelId: currentAmenity.hotelId, 
                name: currentAmenity.name,
                description: currentAmenity.description,
            };
            
            if (isEditing) {
                await api.put(`/hotel-amenities/${currentAmenity.id}`, dataToSend);
                toast.success(`✅ Cập nhật tiện ích "${dataToSend.name}" thành công!`);
            } else {
                await api.post("/hotel-amenities", dataToSend);
                toast.success(`➕ Thêm mới tiện ích "${dataToSend.name}" thành công!`);
            }
            closeModal();
            fetchAmenities();
        } catch (err) {
            console.error("Chi tiết lỗi API:", err); 
            let errorMessage = "Lỗi không xác định. Vui lòng kiểm tra Server.";
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message; 
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            toast.error(`❌ Lỗi khi lưu: ${errorMessage}`);
            setError(`Lỗi khi lưu: ${errorMessage}`);
        }
    };

    // Xử lý Xóa tiện ích
    const handleDelete = async (id, name) => {
        if (!canManageAmenities) {
            toast.error("Bạn không có quyền thực hiện thao tác này.");
            return;
        }

        if (!window.confirm(`Bạn có chắc muốn xóa tiện ích "${name}" này? Thao tác này không thể hoàn tác.`)) return;
        
        try {
            await api.delete(`/hotel-amenities/${id}`);
            toast.info(`🗑️ Đã xóa tiện ích "${name}" thành công!`);
            fetchAmenities();
        } catch (err) {
            const errorMessage = err.message || "Không thể xóa. Có thể tiện ích này đang được sử dụng.";
            toast.error(`❌ Lỗi khi xóa: ${errorMessage}`);
        }
    };
    
    // --- RENDER ---
    if (!canManageAmenities) {
        return <p className="text-danger text-center mt-5 p-4 bg-light rounded shadow-sm" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
            Lỗi: Bạn không có quyền truy cập trang Quản lý Tiện ích. Yêu cầu vai trò **MANAGER**.
        </p>;
    }

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-primary">Đang tải dữ liệu Tiện ích...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <h3 className="mb-4 text-center text-secondary border-bottom pb-2" style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                🛎️ QUẢN LÝ TIỆN ÍCH KHÁCH SẠN
            </h3>

            {error && !showModal && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            {/* START: Nút Thêm mới và Ô Tìm kiếm */}
            <div className="d-flex justify-content-between align-items-center mb-3"> 
                {canManageAmenities && (
                    <Button variant="success" 
                            className="shadow-lg btn-lg" 
                            onClick={() => openModal()}
                            style={{ background: '#28a745', borderColor: '#28a745', fontWeight: 600 }}
                    >
                        ➕ THÊM TIỆN ÍCH MỚI
                    </Button>
                )}
                
                <Form className="d-flex w-50"> 
                    <Form.Control
                        type="search"
                        placeholder="Tìm kiếm theo Tên/Mô tả..."
                        className="me-2"
                        aria-label="Search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </Form>
            </div>
            {/* END: Nút Thêm mới và Ô Tìm kiếm */}


            {/* Bảng dữ liệu */}
            <div className="shadow-2xl rounded-xl table-responsive bg-white p-3 border border-gray-200">
                <Table striped bordered hover className="m-0 align-middle caption-top"> 
                    <caption className="text-primary fw-bold mb-2">
                        Danh sách Tiện ích (Khách sạn ID: **{DEFAULT_HOTEL_ID}**)
                    </caption>
                    <thead className="table-dark shadow-md">
                        <tr style={{ backgroundColor: '#007bff' }}>
                            <th className="text-center" style={{ width: '5%' }}>ID</th>
                            <th style={{ width: '25%' }}>Tên tiện ích</th>
                            <th style={{ width: '45%' }}>Mô tả</th>
                            <th className="text-center" style={{ width: '15%' }}>Ngày tạo</th>
                            {canManageAmenities && <th className="text-center" style={{ width: '10%' }}>Hành động</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentAmenities.length > 0 ? (
                            currentAmenities.map((amenity, index) => (
                                <tr key={amenity.id} className={index % 2 === 0 ? 'bg-light' : 'bg-white'}>
                                    <td className="text-center text-muted fw-light">{amenity.id}</td>
                                    <td className="fw-bold text-primary">{amenity.name}</td>
                                    <td>
                                        <span title={amenity.description}>
                                            {amenity.description?.substring(0, 100) + (amenity.description?.length > 100 ? '...' : '')}
                                        </span>
                                    </td>
                                    <td className="text-center text-secondary small">
                                        {formatDate(amenity.createdAt)}
                                    </td>
                                    {canManageAmenities && (
                                        <td className="text-center text-nowrap">
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2 text-white shadow-sm"
                                                onClick={() => openModal(amenity)}
                                            >
                                                ✏️ Sửa
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="shadow-sm"
                                                onClick={() => handleDelete(amenity.id, amenity.name)}
                                            >
                                                🗑️ Xóa
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={canManageAmenities ? "5" : "4"} className="text-center py-5 text-secondary">
                                    📋 Hiện chưa có tiện ích nào được tìm thấy.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* START: Pagination Component */}
            {filteredAmenities.length > amenitiesPerPage && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                        <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />

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

            {/* Modal Thêm/Sửa Tiện ích */}
            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton className={isEditing ? "bg-warning text-dark" : "bg-primary text-white"}>
                    <Modal.Title>{isEditing ? "Chỉnh Sửa Tiện ích" : "Thêm Tiện ích mới"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Tên tiện ích <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentAmenity.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={currentAmenity.description}
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

        </div>
    );
};

export default HotelAmenityManagement;