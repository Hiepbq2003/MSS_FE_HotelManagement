import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/apiConfig';
import { FaBed, FaCalendarCheck, FaDollarSign, FaCheck, FaTimes, FaUserTie, FaChartLine } from 'react-icons/fa';

// --- Constants ---
const ALLOWED_ACCESS_ROLES = ['ADMIN', 'MANAGER', 'RECEPTION'];

// --- UTILITY FUNCTIONS ---

/**
 * Hàm định dạng tiền tệ (VND)
 */
const formatVND = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === null) return '0 VND';

    return numAmount.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).replace('₫', 'VND');
};

/**
 * Hàm trích xuất lỗi chi tiết
 */
const getErrorMessage = (err) => {
    // ... (Giữ nguyên hàm này)
    if (err && err.message === "Request timeout") {
        return "Server không phản hồi (Timeout).";
    }
    if (err && err.message && err.message.includes("Failed to fetch")) {
        return "Lỗi kết nối mạng.";
    }
    if (err && err.status === 403) {
        return "Không có quyền truy cập (403 Forbidden).";
    }
    if (err && err.status === 401) {
        return "Token hết hạn hoặc không hợp lệ (Vui lòng đăng nhập lại).";
    }

    let message = "Lỗi không xác định.";
    if (err && err.message) message = err.message;
    if (err && err.data && typeof err.data === 'object' && (err.data.message || err.data.error)) {
        message = err.data.message || err.data.error;
    }
    return message;
};


// --- CHART COMPONENTS ---

// 1. Biểu đồ Tròn (Doughnut Chart Replacement)
const DoughnutPlaceholder = ({ available, booked, total }) => {
    if (total === 0) {
        return <p className="text-muted text-center pt-5">Không có dữ liệu phòng.</p>;
    }

    const availablePercent = total > 0 ? (available / total) * 100 : 0;
    const bookedPercent = total > 0 ? (booked / total) * 100 : 0;
    const innerColor = availablePercent > 50 ? 'text-success' : 'text-danger';

    return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
            <div
                className="position-relative d-flex align-items-center justify-content-center"
                style={{
                    width: '200px',
                    height: '200px',
                    background: `conic-gradient(#198754 0% ${availablePercent}%, #dc3545 ${availablePercent}% 100%)`,
                    borderRadius: '50%',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
            >
                <div
                    className="bg-white rounded-circle position-absolute"
                    style={{
                        width: '120px',
                        height: '120px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span className={`fw-bold ${innerColor} fs-3`}>{total}</span>
                    <span className="text-muted small">Tổng phòng</span>
                </div>
            </div>

            <div className="mt-4 text-start w-100" style={{ maxWidth: '250px' }}>
                <LegendItem color="bg-success" label="Phòng Trống" value={`${available} (${availablePercent.toFixed(1)}%)`} />
                <LegendItem color="bg-danger" label="Phòng Đã Đặt" value={`${booked} (${bookedPercent.toFixed(1)}%)`} />
            </div>
        </div>
    );
};

const LegendItem = ({ color, label, value }) => (
    <div className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
        <div className="d-flex align-items-center">
            <span className={`rounded-circle ${color} me-2`} style={{ width: '10px', height: '10px' }}></span>
            <span className="text-muted small fw-semibold">{label}:</span>
        </div>
        <span className="fw-bold">{value}</span>
    </div>
);

// 2. Biểu đồ Cột Doanh thu 30 ngày (Vertical Bar Chart)
const RevenueBarChart = ({ data }) => {
    const maxRevenue = Math.max(...data.values);

    return (
        <div className="h-100 p-3 overflow-auto" style={{ maxHeight: '400px' }}>
            <div className="d-flex align-items-end justify-content-start" style={{ height: '300px', width: `${data.labels.length * 60}px`, minWidth: '100%' }}>
                {data.values.map((value, index) => {
                    const heightPercent = maxRevenue > 0 ? (value / maxRevenue) * 95 : 0;
                    const displayValue = (value / 1000000).toFixed(1);

                    return (
                        <div key={index} className="d-flex flex-column align-items-center mx-1" style={{ width: '50px', flexShrink: 0 }}>
                            <div
                                className="bg-info rounded-top shadow-sm"
                                style={{
                                    height: `${heightPercent}%`,
                                    width: '80%',
                                    transition: 'height 0.5s ease-out',
                                }}
                                title={`${formatVND(value)}`}
                            ></div>
                            <small className="text-dark fw-bold mt-1" style={{ fontSize: '0.65rem' }}>{displayValue}Tr</small>
                            <small className="mt-1 text-muted" style={{ fontSize: '0.7rem' }}>{data.labels[index]}</small>
                        </div>
                    );
                })}
            </div>
            <div style={{ height: '1px', backgroundColor: '#ccc', marginTop: '10px' }}></div>
        </div>
    );
};

/**
 * Hàm tạo dữ liệu doanh thu giả lập 30 ngày (Dùng Date thuần)
 */
const generateMonthlyRevenueData = (monthlyRevenue) => {
    const numericRevenue = Number(monthlyRevenue);
    const DAYS_IN_MONTH = 30;

    const revenue = (numericRevenue && numericRevenue > 500000) ? numericRevenue : 75000000;
    const baseDailyRevenue = revenue / DAYS_IN_MONTH;

    const labels = [];
    const values = [];

    for (let i = DAYS_IN_MONTH - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        let label = '';
        if (i === 0) {
            label = `${day}/${month}`; // Hôm nay
        } else if (date.getDate() === 1 || date.getDate() === 10 || date.getDate() === 20) {
            label = `${day}/${month}`;
        } else {
            label = '';
        }
        labels.push(label);

        const dailyValue = Math.max(0, baseDailyRevenue + (Math.random() - 0.5) * baseDailyRevenue * 0.7);
        values.push(Math.round(dailyValue / 100000) * 100000);
    }

    return { labels, values };
};


const DashBoard = () => {
    const [stats, setStats] = useState({
        totalRooms: 0,
        availableRooms: 0,
        bookedRooms: 0,
        totalMonthlyRevenue: 0,
        totalAnnualRevenue: 0,
        totalEmployees: null,
        bookingsToday: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserRole = localStorage.getItem('userRole') ? localStorage.getItem('userRole').toUpperCase() : '';

    const revenueChartData = useMemo(() => {
        return generateMonthlyRevenueData(stats.totalMonthlyRevenue);
    }, [stats.totalMonthlyRevenue]);


    // --- Data Fetching Logic ---
    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/dashboard/stats');
            const data = response.data || response;

            setStats({
                ...data,
                bookingsToday: data.bookingsToday !== undefined ? data.bookingsToday : 0,
            });

            setError(null);
        } catch (err) {
            console.error("Lỗi tải dữ liệu Dashboard:", err);
            const errorMessage = getErrorMessage(err);
            setError(`Không thể tải dữ liệu Dashboard. ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Side Effects (Initial Load & Permission Check) ---
    useEffect(() => {
        if (!ALLOWED_ACCESS_ROLES.includes(currentUserRole)) {
            setError(`Bạn không có quyền truy cập trang Dashboard này. Chỉ ${ALLOWED_ACCESS_ROLES.join(', ')} mới được phép.`);
            setLoading(false);
            return;
        }

        fetchDashboardStats();
    }, [currentUserRole]);

    // Chuẩn bị dữ liệu hiển thị cho các Stats Cards
    const statsData = [
        {
            title: "Tổng số Phòng",
            value: stats.totalRooms,
            icon: FaBed,
            bgColor: "bg-primary",
        },
        {
            title: "Phòng Trống",
            value: stats.availableRooms,
            icon: FaCheck,
            bgColor: "bg-success",
        },
        {
            title: "Phòng Đã Đặt",
            value: stats.bookedRooms,
            icon: FaTimes,
            bgColor: "bg-danger",
        },
        {
            title: "Đặt phòng hôm nay",
            value: stats.bookingsToday,
            icon: FaCalendarCheck,
            bgColor: "bg-info",
        },
        {
            title: "Tổng Thu tháng",
            value: formatVND(stats.totalMonthlyRevenue),
            icon: FaDollarSign,
            bgColor: "bg-warning",
        },
        {
            title: "Tổng Thu năm",
            value: formatVND(stats.totalAnnualRevenue),
            icon: FaDollarSign,
            bgColor: "bg-secondary",
        },
        ...(stats.totalEmployees !== null ? [{
            title: "Tổng số Nhân viên",
            value: stats.totalEmployees,
            icon: FaUserTie,
            bgColor: "bg-dark",
        }] : [])
    ];

    // --- RENDER ---
    if (loading) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Đang tải dữ liệu Dashboard từ API...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid py-5 text-center">
                <div className="alert alert-danger shadow-sm" role="alert">
                    <strong>Lỗi:</strong> {error}
                    <button onClick={fetchDashboardStats} className="btn btn-sm btn-link text-danger ms-3 fw-bold">Thử lại</button>
                </div>
            </div>
        );
    }


    return (
        <div className="container-fluid py-4">
            <h1 className='text-center mb-4 text-primary fw-bolder'>
                📊 Bảng Điều Khiển Quản Lý Khách Sạn
            </h1>

            <p className='text-center text-muted mb-5'>
                Chào mừng, **{currentUserRole}**. Dưới đây là tổng quan hiệu suất kinh doanh hiện tại.
            </p>

            {/* Hàng chứa các ô thống kê (Stats Cards) */}
            <div className="row">
                {statsData.map((stat, index) => (
                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>
                        <div className={`card text-white ${stat.bgColor} shadow-lg h-100 rounded-4 border-0 hover-lift`}>
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-8">
                                        <p className="card-title text-white mb-1 fw-bold opacity-75">{stat.title}</p>
                                        <h2 className="card-text fw-bolder text-truncate mt-1">{stat.value}</h2>
                                    </div>
                                    <div className="col-4 text-end">
                                        {stat.icon && <stat.icon size={48} style={{ color: '#ffffff', opacity: 0.8 }} />}
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer bg-transparent border-top-0 pt-0 pb-3">
                                <small className="text-white opacity-75">Cập nhật thời gian thực</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <hr className="my-5 border-2 border-primary opacity-25"/>

            {/* Khu vực Biểu đồ/Bảng dữ liệu */}
            <div className="row">
                <div className="col-lg-8 mb-4">
                    <div className="card shadow-lg h-100 rounded-4">
                        <div className="card-header bg-light border-bottom-0 rounded-top-4 d-flex align-items-center fw-bold text-primary py-3">
                            <FaChartLine className="me-2"/> Biến động Doanh thu 30 ngày Gần nhất
                        </div>
                        <div className="card-body">
                            <RevenueBarChart data={revenueChartData} />
                            <p className="text-center text-muted small mt-3">Đơn vị: Triệu VND (Dữ liệu giả lập dựa trên Tổng Thu tháng)</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 mb-4">
                    <div className="card shadow-lg h-100 rounded-4">
                        <div className="card-header bg-light border-bottom-0 rounded-top-4 fw-bold text-primary py-3">
                            Tỷ lệ Trạng thái Phòng
                        </div>
                        <div className="card-body d-flex align-items-center justify-content-center">
                            <DoughnutPlaceholder
                                available={stats.availableRooms}
                                booked={stats.bookedRooms}
                                total={stats.totalRooms}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-5 border-2 border-primary opacity-25"/>

            {/* Bảng đặt phòng sắp tới (Giữ nguyên Placeholder) */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-lg rounded-4">
                        <div className="card-header bg-light fw-bold text-primary py-3">
                            Danh sách Đặt phòng Sắp tới & Đang chờ
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Mã Đặt</th>
                                            <th>Khách hàng</th>
                                            <th>Phòng</th>
                                            <th>Ngày Check-in</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td colSpan="5" className="text-center text-muted py-5">Chưa có dữ liệu. Hãy thêm logic lấy danh sách đặt phòng từ API tại đây.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .hover-lift {
                    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                }
                .hover-lift:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default DashBoard;