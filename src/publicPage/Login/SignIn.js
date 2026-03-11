import React from "react";
import "./Login.css";
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn } from "react-icons/fa";
import api from "../../api/apiConfig";

// Component nhận prop onLoginSuccess từ Login.js
function SignInForm({ onLoginSuccess, onForgotPasswordClick }) {
  const [state, setState] = React.useState({ email: "", password: "" });
  const [error, setError] = React.useState(null);

  const handleChange = (evt) => {
    setState({ ...state, [evt.target.name]: evt.target.value });
  };

  // Hàm xử lý logic lưu thông tin đăng nhập thành công
  const handleLoginSuccess = (loginData) => {
    // 🎯 Lấy các trường thông tin cần thiết từ loginData
    // Giả sử backend trả về: { token, role, email, fullName, phone, id, userId, ... }
    const { token, role, email, fullName, phone, id, userId: staffId } = loginData; 
    
    // 🆕 FIX: Sử dụng trường 'id' hoặc 'staffId' (hoặc 'userId') tùy theo backend trả về
    const finalId = id || staffId || ""; // Ưu tiên 'id', nếu không có thì dùng 'staffId', nếu không có thì dùng ""
    
    console.log("🔐 Login response data:", loginData);
    
    // 🎯 LƯU CẢ 'id' VÀ 'customerId' (đã fix để không lưu "undefined")
    // Lưu ID dưới cả hai tên để các component cũ/mới đều dùng được
    localStorage.setItem("customerId", finalId); 
    localStorage.setItem("userId", finalId);     
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("email", email);
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("phone", phone);
  
    console.log("💾 Saved to localStorage - ID:", finalId, "Role:", role);
  
    // Gọi hàm callback thành công
    if (onLoginSuccess) {
      onLoginSuccess(role);
    }
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    setError(null);
  
    const loginPayload = {
      email: state.email,
      password: state.password,
    };
  
    let loginSuccessful = false;
    let loginData = null;
  
    try {
      // 1. Thử đăng nhập Staff
      const response = await api.post("/auth/staff/login", loginPayload);
      
      // 🎯 DEBUG CHI TIẾT RESPONSE
      console.log("🔐 Staff login response:", response);
      console.log("🔐 Response fields:", Object.keys(response));
      
      loginData = response;
      loginSuccessful = true;
      console.log("✅ Đăng nhập Staff thành công.");
  
    } catch (errStaff) {
      console.log("❌ Đăng nhập Staff thất bại, thử sang User...");
  
      try {
        // 2. Thử đăng nhập User
        const response = await api.post("/auth/login", loginPayload);
        
        // 🎯 DEBUG CHI TIẾT RESPONSE
        console.log("🔐 User login response:", response);
        console.log("🔐 Response fields:", Object.keys(response));
        
        loginData = response;
        loginSuccessful = true;
        console.log("✅ Đăng nhập User thành công.");
        
      } catch (errUser) {
        console.error("❌ Lỗi đăng nhập cả Staff và User:", errUser);
        const errorMessage = errUser.response?.data?.message || errUser?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.";
        setError(errorMessage);
      }
    }
  
    if (loginSuccessful && loginData) {
      handleLoginSuccess(loginData);
    }
  
    setState({ ...state, password: "" });
  };
  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>

        <div className="social-container">
          <a href="#">
            <FaFacebookF />
          </a>
          <a href="#">
            <FaGooglePlusG />
          </a>
          <a href="#">
            <FaLinkedinIn />
          </a>
        </div>

        <span>or use your account</span>

        {error && (
          <p style={{ color: "red", margin: "10px 0", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <input
          type="email"
          name="email"
          value={state.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onForgotPasswordClick) onForgotPasswordClick();
          }}
          style={{ cursor: "pointer", color: "#333" }}
        >
          Forgot your password?
        </a>

        <button type="submit" className="sign">
          Sign In
        </button>
      </form>
    </div>
  );
}

export default SignInForm;