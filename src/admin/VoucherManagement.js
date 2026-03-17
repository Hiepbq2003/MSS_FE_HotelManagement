import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, Form, Badge, Row, Col, Spinner, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../api/apiConfig"; 

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/vouchers");
            setVouchers(Array.isArray(res) ? res : []);
        } catch (err) {
            toast.error("Không thể tải danh sách khuyến mãi!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        data.discountValue = parseFloat(data.discountValue);
        data.minOrderValue = data.minOrderValue ? parseFloat(data.minOrderValue) : 0;
        data.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : 0;

        try {
            if (editData) {
                // Sửa
                await api.put(`/vouchers/${editData.id}`, data);
                toast.success("Cập nhật Voucher thành công!");
            } else {
                // Thêm mới
                await api.post("/vouchers", data);
                toast.success("Tạo Voucher mới thành công!");
            }
            setShowModal(false);
            fetchVouchers();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Lỗi khi lưu dữ liệu Voucher!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Xử lý Xóa
    const handleDelete = async (id, code) => {
        if (!window.confirm(`Bạn có chắc muốn xóa mã ${code}? Hành động này không thể hoàn tác.`)) return;
        
        try {
            await api.delete(`/vouchers/${id}`);
            toast.info(`Đã xóa mã ${code}!`);
            fetchVouchers();
        } catch (err) {
            toast.error("Không thể xóa Voucher này (có thể đã được sử dụng trong Booking).");
        }
    };

    const formatDiscount = (type, value) => {
        if (type === 'PERCENTAGE') return `${value}%`;
        return `${value.toLocaleString('vi-VN')} VNĐ`;
    };

    const formatDateTimeForInput = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toISOString().substring(0, 16);
    };

    return (
        <Container className="py-4">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <h3 className="text-primary fw-bold mb-0">🎟️ Quản lý Khuyến mãi & Voucher</h3>
                <div>
                    <Button variant="outline-primary" onClick={fetchVouchers} className="me-2">
                        <i className="bi bi-arrow-clockwise"></i> Tải lại
                    </Button>
                    <Button variant="success" onClick={() => { setEditData(null); setShowModal(true); }}>
                        ➕ Tạo mã mới
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>
            ) : (
                <div className="shadow-sm rounded table-responsive bg-white">
                    <Table striped bordered hover className="align-middle mb-0 text-center">
                        <thead className="table-dark">
                            <tr>
                                <th>Mã CODE</th>
                                <th>Loại giảm</th>
                                <th>Mức giảm</th>
                                <th>Đơn tối thiểu</th>
                                <th>Đã dùng / Giới hạn</th>
                                <th>Hạn sử dụng</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.length > 0 ? vouchers.map(v => (
                                <tr key={v.id}>
                                    <td className="fw-bold text-success text-uppercase">{v.code}</td>
                                    <td>{v.discountType === 'PERCENTAGE' ? <Badge bg="info">% Phần trăm</Badge> : <Badge bg="secondary">Tiền mặt</Badge>}</td>
                                    <td className="fw-bold text-danger">{formatDiscount(v.discountType, v.discountValue)}</td>
                                    <td>{v.minOrderValue ? `${v.minOrderValue.toLocaleString('vi-VN')}đ` : 'Không có'}</td>
                                    <td>
                                        <span className={v.usedCount >= v.usageLimit ? "text-danger fw-bold" : ""}>
                                            {v.usedCount}
                                        </span> / {v.usageLimit > 0 ? v.usageLimit : '∞'}
                                    </td>
                                    <td className="small">
                                        {new Date(v.endDate).toLocaleDateString('vi-VN')} <br/>
                                        <span className="text-muted">{new Date(v.endDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </td>
                                    <td>
                                        <Badge bg={v.status === 'ACTIVE' ? 'success' : v.status === 'EXPIRED' ? 'warning' : 'danger'}>
                                            {v.status === 'ACTIVE' ? 'Hoạt động' : v.status === 'EXPIRED' ? 'Hết hạn' : 'Đã khóa'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button variant="outline-warning" size="sm" className="me-2 mb-1" 
                                            onClick={() => { setEditData(v); setShowModal(true); }}>Sửa</Button>
                                        <Button variant="outline-danger" size="sm" className="mb-1"
                                            onClick={() => handleDelete(v.id, v.code)}>Xóa</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="py-4 text-muted">Chưa có mã khuyến mãi nào.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* MODAL THÊM / SỬA VOUCHER */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className={editData ? "bg-warning" : "bg-primary text-white"}>
                    <Modal.Title>{editData ? "Sửa thông tin Voucher" : "Tạo Voucher mới"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Mã Voucher (Code) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control name="code" defaultValue={editData?.code} required placeholder="VD: SUMMER2024, TET50K..." style={{ textTransform: 'uppercase' }} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Trạng thái</Form.Label>
                                    <Form.Select name="status" defaultValue={editData?.status || "ACTIVE"}>
                                        <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                                        <option value="DISABLED">Vô hiệu hóa (DISABLED)</option>
                                        <option value="EXPIRED">Đã hết hạn (EXPIRED)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Loại giảm giá</Form.Label>
                                    <Form.Select name="discountType" defaultValue={editData?.discountType || "FIXED_AMOUNT"}>
                                        <option value="PERCENTAGE">Giảm theo %</option>
                                        <option value="FIXED_AMOUNT">Giảm tiền mặt (VNĐ)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Mức giảm <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="number" name="discountValue" defaultValue={editData?.discountValue} required placeholder="VD: 10 hoặc 50000" min="1" step="any" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Đơn tối thiểu để áp dụng</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="number" name="minOrderValue" defaultValue={editData?.minOrderValue} placeholder="VD: 500000" min="0" />
                                        <InputGroup.Text>VNĐ</InputGroup.Text>
                                    </InputGroup>
                                    <Form.Text className="text-muted">Để trống hoặc 0 nếu không yêu cầu.</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Giới hạn số lần sử dụng</Form.Label>
                                    <Form.Control type="number" name="usageLimit" defaultValue={editData?.usageLimit} placeholder="VD: 100" min="1" />
                                    <Form.Text className="text-muted">Số lượt nhập tối đa của mã này.</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Thời gian bắt đầu <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="datetime-local" name="startDate" defaultValue={formatDateTimeForInput(editData?.startDate)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Thời gian kết thúc <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="datetime-local" name="endDate" defaultValue={formatDateTimeForInput(editData?.endDate)} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Mô tả chi tiết</Form.Label>
                            <Form.Control as="textarea" rows={2} name="description" defaultValue={editData?.description} placeholder="Mô tả về chương trình khuyến mãi này..." />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                        <Button variant={editData ? "warning" : "primary"} type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner size="sm" animation="border" /> : (editData ? "Lưu thay đổi" : "Tạo mã")}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default VoucherManagement;