import React from 'react';

const MAIN_COLOR = '#fbb500';

// --- 1. Component Gallery Card (Hiệu ứng Slide-up & Glassmorphism) ---
const GalleryCard = ({ img, height, title, sub, isLarge = false }) => (
    <div className="modern-g-card" style={{
        height: isLarge ? '700px' : height,
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }}>
        {/* Background Image */}
        <div className="g-img-bg" style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            transition: 'transform 0.8s ease'
        }} />

        {/* Overlay Layer */}
        <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
            zIndex: 1
        }} />

        {/* Text Content Layer */}
        <div className="g-card-content" style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '30px',
            zIndex: 2,
            transform: 'translateY(15px)',
            opacity: 0.9,
            transition: 'all 0.4s ease'
        }}>
            <h3 style={{ 
                color: '#fff', 
                fontSize: isLarge ? '2.2rem' : '1.4rem', 
                fontWeight: '700', 
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
                {title}
            </h3>
            {sub && (
                <p style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '0.95rem', 
                    marginTop: '10px',
                    lineHeight: '1.5',
                    display: 'none' // Sẽ hiện ra khi hover
                }}>
                    {sub}
                </p>
            )}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
            .modern-g-card:hover .g-img-bg { transform: scale(1.1); }
            .modern-g-card:hover .g-card-content { transform: translateY(-10px); opacity: 1; }
            .modern-g-card:hover .g-card-content p { display: block; animation: fadeInUp 0.4s forwards; }
            .modern-g-card:hover { transform: translateY(-5px); boxShadow: 0 20px 40px rgba(0,0,0,0.15); }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}} />
    </div>
);

// --- 2. Main AboutUs Component ---
const AboutUs = () => {
    // Mẹo: Tự động lấy URL gốc (Dùng cho cả Vite và CRA)
    const publicPath = process.env.PUBLIC_URL || '';

    return (
        <div style={{ backgroundColor: '#fff', color: '#1a1a1a', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header Section: Welcome */}
            <section style={{ padding: '120px 0 80px' }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <span style={{ 
                                color: MAIN_COLOR, 
                                fontWeight: '700', 
                                letterSpacing: '3px', 
                                textTransform: 'uppercase', 
                                fontSize: '0.9rem',
                                display: 'block',
                                marginBottom: '15px'
                            }}>
                                Established 1910
                            </span>
                            <h2 style={{ 
                                fontSize: '4rem', 
                                fontWeight: '800', 
                                lineHeight: '1.1', 
                                marginBottom: '30px',
                                letterSpacing: '-1px'
                            }}>
                                Welcome to <span style={{ color: MAIN_COLOR }}>Sona Hotel.</span>
                            </h2>
                            <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: '1.8', maxWidth: '540px' }}>
                                Built during the Belle Époque period, this landmark hotel is located in the heart of Paris. 
                                We combine timeless elegance with modern comfort to create an unforgettable sanctuary.
                            </p>
                            
                            <div style={{ marginTop: '40px', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                                {[
                                    '20% Off Accommodation',
                                    'Daily Breakfast',
                                    'Premium Laundry',
                                    'Free High-Speed Wifi'
                                ].map((service, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '1rem' }}>
                                        <div style={{ 
                                            width: '24px', height: '24px', borderRadius: '50%', 
                                            backgroundColor: 'rgba(251, 181, 0, 0.15)', color: MAIN_COLOR,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginRight: '12px', fontSize: '0.8rem'
                                        }}>✔</div>
                                        {service}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-lg-5 offset-lg-1">
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={`${publicPath}/about/about-p1.jpg`} 
                                    alt="Hotel View" 
                                    style={{ width: '100%', borderRadius: '30px', boxShadow: '20px 20px 60px rgba(0,0,0,0.1)' }} 
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-30px',
                                    left: '-30px',
                                    backgroundColor: MAIN_COLOR,
                                    padding: '30px',
                                    borderRadius: '20px',
                                    color: 'white',
                                    textAlign: 'center',
                                    boxShadow: '0 10px 30px rgba(251, 181, 0, 0.3)'
                                }}>
                                    <h4 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>110+</h4>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>Years of Excellence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Section: Cinematic Autoplay (Full Width) */}
            <section style={{ position: 'relative', height: '650px', overflow: 'hidden', backgroundColor: '#000' }}>
                <iframe
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100vw',
                        height: '56.25vw', // Tỷ lệ 16:9
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none'
                    }}
                    // Giải thích link: autoplay=1 (tự chạy), mute=1 (tắt tiếng - bắt buộc để chạy), loop=1 & playlist (để lặp lại)
                    src="https://www.youtube.com/embed/H1CIBqDeWQ0?autoplay=1&mute=1&loop=1&playlist=H1CIBqDeWQ0&controls=0&showinfo=0&rel=0&modestbranding=1"
                    title="Hotel Cinematic Tour"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                ></iframe>

                {/* Glassmorphism Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{ 
                        padding: '40px', 
                        borderRadius: '30px', 
                        backdropFilter: 'blur(4px)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        maxWidth: '800px',
                        margin: '0 20px'
                    }}>
                        <h2 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
                            Experience Our Atmosphere
                        </h2>
                        <p style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.9 }}>
                            Discover the perfect harmony of heritage and contemporary luxury.
                        </p>
                    </div>
                </div>
            </section>

            {/* Gallery Section: Modern Grid */}
            <section style={{ padding: '120px 0', backgroundColor: '#fff' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '70px' }}>
                        <span style={{ color: MAIN_COLOR, fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Our Gallery
                        </span>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginTop: '10px' }}>Capturing Moments</h2>
                    </div>

                    <div className="row g-4">
                        {/* Cột Trái: 1 Ảnh lớn trên, 2 ảnh nhỏ dưới */}
                        <div className="col-lg-7">
                            <div className="row g-4">
                                <div className="col-12">
                                    <GalleryCard 
                                        img={`${publicPath}/gallery/gallery-1.jpg`} 
                                        height="420px" 
                                        title="Imperial Suites" 
                                        sub="Sophisticated interiors designed for the ultimate comfort and relaxation."
                                    />
                                </div>
                                <div className="col-md-6">
                                    <GalleryCard 
                                        img={`${publicPath}/gallery/gallery-3.jpg`} 
                                        height="300px" 
                                        title="Grand Ballroom" 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <GalleryCard 
                                        img={`${publicPath}/gallery/gallery-4.jpg`} 
                                        height="300px" 
                                        title="Signature Dining" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cột Phải: 1 Ảnh cực lớn */}
                        <div className="col-lg-5">
                            <GalleryCard 
                                img={`${publicPath}/gallery/gallery-2.jpg`} 
                                isLarge={true} 
                                title="Infinity Pool" 
                                sub="A breathtaking view of Paris from our rooftop oasis, perfect for summer days."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer-like Branding */}
            <section style={{ padding: '80px 0', textAlign: 'center', borderTop: '1px solid #eee' }}>
                <div className="container">
                    <h3 style={{ fontWeight: '300', fontStyle: 'italic', color: '#999' }}>"Luxury is in each detail."</h3>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;