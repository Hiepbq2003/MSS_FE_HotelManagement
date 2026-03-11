import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

const MAIN_COLOR = '#fbb500'; // Màu Vàng/Cam chủ đạo

// --- Component con quản lý hover state và style ---
// Đã thêm subtitle vào props
const GalleryItemHover = ({ imgUrl, height, title, subtitle, isLarge = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Dùng 700px cho Large item như yêu cầu cũ
    const baseHeight = isLarge ? '700px' : height;
    const opacity = isHovered ? 1 : 0;
    
    // 1. STYLE TĨNH CỦA KHỐI HÌNH ẢNH (gallery-item)
    const galleryItemStyle = {
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: baseHeight,
        position: 'relative',
        borderRadius: '5px',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0,0,0,0.15)', 
        cursor: 'pointer',
        // Hiệu ứng scale nhẹ khi hover
        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 0.4s ease-out',
    };

    // 2. STYLE CỦA LỚP OVERLAY TỐI (Mô phỏng ::after)
    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(25, 25, 26, 0.55)', // Tối hơn một chút
        opacity: opacity, // Điều khiển opacity bằng state
        transition: 'opacity 0.3s',
        zIndex: 2,
    };
    
    // 3. STYLE CỦA TEXT VÀ KHU VỰC TEXT (Mô phỏng .gi-text)
    const textWrapperStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        opacity: opacity, 
        transition: 'opacity 0.3s 0.1s', 
    };

    const titleStyle = {
        color: '#ffffff',
        fontSize: isLarge ? '2.4rem' : '1.8rem',
        fontWeight: '700',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
        textAlign: 'center',
        padding: '0 20px',
        margin: '0',
    };
    
    // --- STYLE CHO SUBTITLE ĐÃ THIẾT LẬP ---
    const subtitleStyle = {
        color: '#f9f9f9', // Màu trắng ngà
        fontSize: isLarge ? '1.2rem' : '1rem',
        fontWeight: '400',
        marginTop: '10px',
        textAlign: 'center',
        padding: '0 20px',
        maxWidth: '80%', // Giới hạn chiều rộng để subtitle không quá dài
        margin: '10px auto 0 auto', // Căn giữa
    };
    // ----------------------------------------

    return (
        <div 
            className="gallery-item"
            style={galleryItemStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Lớp Overlay tối (Mô phỏng ::after) */}
            <div style={overlayStyle}></div> 
            
            {/* Vùng Text và Tiêu đề (Mô phỏng .gi-text) */}
            <div style={textWrapperStyle}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <h3 style={titleStyle}>{title}</h3>
                    {/* Hiển thị Subtitle nếu có */}
                    {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};
// --- Kết thúc GalleryItemHover Component ---

const AboutUs = () => {
    
    useEffect(() => {
      // Logic side effects (nếu có)
    }, []);

    // Hàm tiện ích để đặt ảnh nền và các thuộc tính cơ bản (sử dụng cho các section khác)
    const getBgStyle = (imgUrl, height = 'auto', color = 'transparent') => ({
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: height,
        backgroundColor: color,
        position: 'relative', 
        borderRadius: '5px', 
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0,0,0,0.15)', 
        transition: 'transform 0.3s ease-in-out', 
        cursor: 'pointer',
    });
    
    // Style cho lớp Overlay của hình ảnh *KHÔNG CÓ HOVER* (dùng cho AboutUs Services)
    const staticOverlayStyle = {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: '25px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))', // Gradient làm mờ dần
        color: 'white',
        zIndex: 2,
    };
    
    // Style cho tiêu đề trong Static Overlay
    const staticOverlayTitleStyle = {
        fontSize: '1.6rem',
        fontWeight: '700',
        margin: '0',
    };


    return (
        <div>
            
            {/* About Us Page Section Begin */}
            <section style={{ padding: '100px 0', backgroundColor: '#f9f9f9' }}> 
                <div className="container">
                    <div className="about-page-text">
                        <div className="row">
                            {/* Cột giới thiệu chính */}
                            <div className="col-lg-6">
                                <div className="ap-title">
                                    <h2 style={{ 
                                        fontSize: '3.2rem', 
                                        fontWeight: '800', 
                                        marginBottom: '25px', 
                                        color: '#222',
                                        lineHeight: '1.1',
                                    }}>
                                        Welcome To Sona.
                                    </h2>
                                    <p style={{ 
                                        color: '#555', 
                                        lineHeight: '1.8', 
                                        fontSize: '17px', 
                                        fontWeight: '300',
                                    }}>
                                        Built in 1910 during the Belle Epoque period, this hotel is located in the center of
                                        Paris, with easy access to the city’s tourist attractions. It offers tastefully
                                        decorated rooms.
                                    </p>
                                </div>
                            </div>
                            {/* Cột dịch vụ ngắn */}
                            <div className="col-lg-5 offset-lg-1">
                                <ul style={{ 
                                    listStyle: 'none', 
                                    paddingLeft: 0, 
                                    marginTop: '25px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px' 
                                }}>
                                    {[
                                        '20% Off On Accommodation.',
                                        'Complimentary Daily Breakfast',
                                        '3 Pcs Laundry Per Day',
                                        'Free Wifi.',
                                        'Discount 20% On F&B'
                                    ].map((service, index) => (
                                        <li key={index} style={{ 
                                            fontSize: '17px', 
                                            color: '#333',
                                            fontWeight: '500',
                                        }}>
                                            <i 
                                                className="icon_check" 
                                                style={{ 
                                                    color: MAIN_COLOR, 
                                                    marginRight: '12px', 
                                                    fontWeight: 'bold',
                                                    fontSize: '1.2rem',
                                                }}
                                            >&#10003;</i> 
                                            {service}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Dịch vụ hình ảnh (KHÔNG CÓ HOVER) - Vẫn dùng style cũ */}
                    <div className="about-page-services" style={{ marginTop: '70px' }}>
                        <div className="row" style={{ gap: '30px 0' }}>
                            {/* Item 1 */}
                            <div className="col-md-4">
                                <div 
                                    className="ap-service-item" 
                                    style={getBgStyle('./about/about-p1.jpg', '350px', '#ccc')}
                                >
                                    <div style={staticOverlayStyle}>
                                        <h3 style={staticOverlayTitleStyle}>Restaurants Services</h3>
                                    </div>
                                </div>
                            </div>
                            {/* Item 2 */}
                            <div className="col-md-4">
                                <div 
                                    className="ap-service-item" 
                                    style={getBgStyle('./about/about-p2.jpg', '350px', '#ccc')}
                                >
                                    <div style={staticOverlayStyle}>
                                        <h3 style={staticOverlayTitleStyle}>Travel & Camping</h3>
                                    </div>
                                </div>
                            </div>
                            {/* Item 3 */}
                            <div className="col-md-4">
                                <div 
                                    className="ap-service-item" 
                                    style={getBgStyle('./about/about-p3.jpg', '350px', '#ccc')}
                                >
                                    <div style={staticOverlayStyle}>
                                        <h3 style={staticOverlayTitleStyle}>Event & Party</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* About Us Page Section End */}

            
            {/* Video Section Begin (Giữ nguyên phần Video) */}
            <section 
                style={{...getBgStyle('./video-bg.jpg', '500px'), boxShadow: 'none'}} 
                className="video-section" 
            >
                {/* Lớp Overlay tối cho Video Section */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)', 
                    zIndex: 1,
                }}></div>

                <div className="container" style={{ position: 'relative', height: '100%', zIndex: 2 }}>
                    <div className="row" style={{ height: '100%', alignItems: 'center' }}>
                        <div className="col-lg-12">
                            <div className="video-text" style={{ textAlign: 'center', color: 'white', padding: '0 15px' }}>
                                <h2 style={{ 
                                    fontSize: '3rem', 
                                    fontWeight: '700', 
                                    marginBottom: '15px',
                                    lineHeight: '1.2',
                                }}>
                                    Discover Our Hotel & Services.
                                </h2>
                                <p style={{ 
                                    fontSize: '1.1rem', 
                                    opacity: '0.9', 
                                    marginBottom: '40px',
                                    fontWeight: '300',
                                }}>
                                   Experience the charm and beauty of our destination
                                </p>
                                <a 
                                    href="https://www.youtube.com/watch?v=H1CIBqDeWQ0" 
                                    className="play-btn video-popup"
                                    style={{ 
                                        display: 'inline-block', 
                                        border: '3px solid white', 
                                        borderRadius: '50%', 
                                        padding: '20px',
                                        transition: 'all 0.3s ease',
                                        lineHeight: '0',
                                        backgroundColor: MAIN_COLOR, 
                                        boxShadow: '0 0 0 10px rgba(255, 255, 255, 0.3)', 
                                    }}
                                >
                                    <img 
                                        src="./play.png" 
                                        alt="Play" 
                                        style={{ 
                                            width: '20px', 
                                            height: '20px',
                                            filter: 'brightness(0) invert(1)', 
                                        }} 
                                    /> 
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Video Section End */}

            
            {/* Gallery Section Begin (Sử dụng GalleryItemHover mới) */}
            <section className="gallery-section spad" style={{ padding: '100px 0', backgroundColor: 'white' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>
                                <span style={{ 
                                    color: MAIN_COLOR, 
                                    textTransform: 'uppercase', 
                                    fontWeight: '700', 
                                    letterSpacing: '2px',
                                    fontSize: '0.9rem',
                                    marginBottom: '8px', 
                                    display: 'block' 
                                }}>
                                    Our Gallery
                                </span>
                                <h2 style={{ 
                                    fontWeight: '800', 
                                    fontSize: '2.8rem',
                                    color: '#222',
                                }}>Discover Our Work</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{ gap: '30px 0' }}>
                        <div className="col-lg-6">
                            {/* Large Image 1 (Top Left) */}
                            <GalleryItemHover 
                                imgUrl={'./gallery/gallery-1.jpg'} 
                                height={'450px'} 
                                title={'Room Luxury'} 
                                subtitle={'Highlighting the stylish and sophisticated interiors of our rooms'}
                            />

                            <div className="row" style={{ marginTop: '30px' }}>
                                {/* Small Image 3 (Bottom Left - Row 1) */}
                                <div className="col-sm-6">
                                    <GalleryItemHover 
                                        imgUrl={'./gallery/gallery-3.jpg'} 
                                        height={'200px'} 
                                        title={'Event Area'} 
                                        subtitle={'Shows professional event areas'}
                                    />
                                </div>
                                {/* Small Image 4 (Bottom Left - Row 2) */}
                                <div className="col-sm-6">
                                    <GalleryItemHover 
                                        imgUrl={'./gallery/gallery-4.jpg'} 
                                        height={'200px'} 
                                        title={'Service Quality'} 
                                        subtitle={'Focuses on service quality and hospitality'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            {/* Extra Large Image 2 (Right) */}
                            <GalleryItemHover 
                                imgUrl={'./gallery/gallery-2.jpg'} 
                                height={'700px'} 
                                title={'Outdoor Amenities'} 
                                subtitle={'Shows the relaxing outdoor amenities and perfect venues for weddings, meetings, and celebrations.'}
                                isLarge={true}
                            />
                        </div>
                    </div>
                </div>
            </section>
            {/* Gallery Section End */}
        </div>
    );
};

export default AboutUs;