import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import SignInForm from "./SignIn";
import SignUpForm from "./SignUp";
import ForgotPassword from "./ForgotPassword"; 
import './Login.css'; 

export default function Login() {
    const [type, setType] = useState("signIn");
    const navigate = useNavigate();

    const handleOnClick = (text) => {
        if (text !== type) setType(text);
    };

    const handleLoginSuccess = (role) => {
        const userRole = role.toUpperCase();

        if (userRole === 'ADMIN') {
            navigate('/admin/dashboard');
        } else if (userRole === 'MANAGER') {
            navigate('/manager/dashboard');
        } else if (userRole === 'RECEPTIONIST') {
            navigate('/reception/check-in');
        } else if (userRole === 'HOUSEKEEPING') {
            navigate('/housekeeping');
        } else {
        
            navigate('/home'); 
        }
    };

    const handleRegisterSuccess = () => {
      
        alert("Đăng ký thành công! Vui lòng Đăng nhập."); 
        
        setType("signIn"); 
    };
    
    // Hàm chuyển về form Đăng nhập (dùng cho ForgotPassword)
    const handleSwitchToSignIn = () => {
        setType("signIn");
    };

    // Hàm chuyển sang form Quên mật khẩu (dùng cho SignInForm)
    const handleSwitchToForgotPassword = () => {
        setType("forgotPassword");
    };
    
    // Hàm quyết định nội dung hiển thị trong panel Sign-In
    const renderLoginPanelContent = () => {
        if (type === "forgotPassword") {
            // Hiển thị form Quên mật khẩu. Truyền hàm để quay lại SignIn
            return <ForgotPassword onSwitchToSignIn={handleSwitchToSignIn} />;
        }
        
        // Hiển thị form Đăng nhập. Truyền hàm để chuyển sang ForgotPassword
        return <SignInForm 
                    onLoginSuccess={handleLoginSuccess}
                    onForgotPasswordClick={handleSwitchToForgotPassword} 
                />;
    };


    // Class container chỉ cần xử lý cho SignUp vì ForgotPassword nằm chung panel với SignIn
    const containerClass =
        "container " + (type === "signUp" ? "right-panel-active" : "");

    return (
        <div className="login-page">
            <h1
                style={{
                    color: "#ffffff",
                    fontSize: "30px",
                    fontWeight: "600",
                    textAlign: "center",
                    margin: "20px 0",
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: "1px",
                    textShadow: "2px 2px 8px rgba(0,0,0,0.4)"
                }}>
                Discover the Best Experience <br /> in Our Hotel
            </h1>

            <div className={containerClass} id="container">
                {/* 1. Panel Đăng ký (Giữ nguyên) */}
                <SignUpForm onRegisterSuccess={handleRegisterSuccess} />
                
                {/* 2. Panel Đăng nhập / Quên Mật khẩu (Dùng hàm Render mới) */}
                {renderLoginPanelContent()}
                
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Ready to Explore?</h1>
                            <p>Start your journey with us. Sign up only takes a few seconds!</p>
                            <button className="ghost" id="signIn" onClick={() => handleOnClick("signIn")}>
                                Sign In
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Welcome</h1>
                            <p>Discover and Find your best healing place</p>
                            <button className="ghost" id="signUp" onClick={() => handleOnClick("signUp")}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}