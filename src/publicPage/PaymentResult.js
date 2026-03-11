import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/apiConfig";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const allParams = Object.fromEntries(queryParams);
        
        console.log("🎯 VNPay Return Params:", allParams);
  
        const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
  
        if (vnp_ResponseCode === "00") {
          // 🎉 LUÔN HIỂN THỊ THÀNH CÔNG (vì booking đã được confirmed từ đầu)
          const successData = {
            status: "success",
            message: "Thanh toán thành công! Đơn đặt phòng của bạn đã được xác nhận.",
            amount: parseInt(allParams.vnp_Amount) / 100,
            transactionNo: allParams.vnp_TransactionNo,
            reservationCode: allParams.vnp_OrderInfo?.replace("Hotel_Booking_", "") || allParams.vnp_TxnRef
          };
          
          setPaymentData(successData);
          
          // 🔄 Cập nhật transaction ref trong backend (không ảnh hưởng UI)
          try {
            await api.get("/payment/vnpay-return", { params: allParams });
            console.log("✅ Transaction ref updated in backend");
          } catch (err) {
            console.log("⚠️ Backend update failed, but booking is still confirmed");
          }
          
        } else {
          // ❌ Nếu thanh toán thất bại, hiển thị lỗi
          setError("Thanh toán thất bại. Vui lòng thử lại.");
        }
        
        setLoading(false);
  
      } catch (err) {
        console.error("Payment processing error:", err);
        setError("Có lỗi xảy ra");
        setLoading(false);
      }
    };
  
    processPaymentResult();
  }, [location]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang xử lý kết quả thanh toán...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-body text-center">
                <div className="text-danger mb-3">
                  <i className="fas fa-times-circle fa-4x"></i>
                </div>
                <h2 className="card-title text-danger">Thanh toán thất bại</h2>
                
                {/* Hiển thị chi tiết lỗi */}
                <div className="alert alert-warning text-start">
                  <h6>Chi tiết lỗi:</h6>
                  <p className="mb-2"><strong>Lỗi:</strong> {error}</p>
                  <p className="mb-0"><strong>Mã lỗi:</strong> Invalid signature</p>
                </div>
                
                <p className="card-text text-muted mb-3">
                  Chữ ký giao dịch không hợp lệ. Có thể do:
                </p>
                <ul className="text-start text-muted small">
                  <li>Thông tin kết nối VNPay chưa chính xác</li>
                  <li>Dữ liệu thanh toán bị thay đổi</li>
                  <li>Lỗi kỹ thuật tạm thời</li>
                </ul>
                
                <div className="mt-4">
                  <Link to="/" className="btn btn-primary me-3">
                    <i className="fas fa-home me-2"></i>Về trang chủ
                  </Link>
                  <button 
                    onClick={() => navigate("/booking")} 
                    className="btn btn-outline-primary me-3"
                  >
                    <i className="fas fa-redo me-2"></i>Thử lại
                  </button>
                  <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-outline-secondary"
                  >
                    <i className="fas fa-arrow-left me-2"></i>Quay lại
                  </button>
                </div>
                
                {/* Thông tin hỗ trợ */}
                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    Cần hỗ trợ? Liên hệ: <strong>1900 1234</strong>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị kết quả thành công
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-success shadow">
            <div className="card-body text-center p-5">
              {/* Icon thành công */}
              <div className="text-success mb-4">
                <i className="fas fa-check-circle fa-5x"></i>
              </div>
              
              {/* Tiêu đề */}
              <h2 className="card-title text-success mb-3">Thanh toán thành công!</h2>
              
              {/* Thông báo */}
              <p className="card-text text-muted mb-4">
                Cảm ơn bạn đã đặt phòng tại khách sạn chúng tôi. 
                Đơn đặt phòng của bạn đã được xác nhận.
              </p>

              {/* Thông tin chi tiết */}
              <div className="bg-light rounded p-4 mb-4 text-start">
                <h5 className="mb-3">Thông tin đặt phòng:</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Mã đặt phòng:</strong></p>
                    <p><strong>Số tiền:</strong></p>
                  </div>
                  <div className="col-md-6">
                    <p>{paymentData?.reservationCode || "N/A"}</p>
                    <p>{paymentData?.amount ? paymentData.amount.toLocaleString() + " VNĐ" : "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Mã giao dịch */}
              {paymentData?.transactionRef && (
                <div className="alert alert-info mb-4">
                  <strong>Mã giao dịch VNPay:</strong> {paymentData.transactionRef}
                </div>
              )}

              {/* Hướng dẫn tiếp theo */}
              <div className="alert alert-warning mb-4">
                <h6 className="alert-heading">📧 Thông báo quan trọng</h6>
                <p className="mb-0">
                  Thông tin xác nhận đặt phòng đã được gửi đến email của bạn. 
                  Vui lòng kiểm tra hộp thư đến và hộp thư spam.
                </p>
              </div>

              {/* Các nút hành động */}
              <div className="d-grid gap-2 d-md-flex justify-content-center">
                <Link to="/" className="btn btn-success btn-lg me-md-3">
                  <i className="fas fa-home me-2"></i>Về trang chủ
                </Link>
                <Link to="/bookings" className="btn btn-outline-primary btn-lg">
                  <i className="fas fa-list me-2"></i>Xem đơn đặt phòng
                </Link>
                <button 
                  onClick={() => window.print()} 
                  className="btn btn-outline-secondary btn-lg"
                >
                  <i className="fas fa-print me-2"></i>In hóa đơn
                </button>
              </div>

              {/* Liên hệ hỗ trợ */}
              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  Cần hỗ trợ? Liên hệ: <strong>1900 1234</strong> hoặc 
                  email: <strong>support@hotel.com</strong>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
