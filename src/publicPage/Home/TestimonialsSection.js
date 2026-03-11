import React from 'react';
import { Carousel, Container } from "react-bootstrap";
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";

const TestimonialsSection = () => {

    const testimonials = [
        {
            name: "Eleanor Vance",
            image: "https://picsum.photos/seed/person1/100", // Placeholder profile image 1
            quote:
                "The level of service at Mr.STELLAR exceeded all expectations. From the immaculate, modern rooms to the personalized dining experiences, every detail contributed to a truly luxurious and memorable escape. Highly recommended for travelers seeking exclusivity and comfort.",
        },
        {
            name: "Marcus Chen",
            image: "https://picsum.photos/seed/person2/100", // Placeholder profile image 2
            quote:
                "A truly stellar experience! The location was perfect, the amenities were world-class, and the staff treated us like royalty. This is the definition of five-star hospitality. We felt completely refreshed and will definitely be returning next year.",
        },
        {
            name: "Olivia Harrison",
            image: "https://picsum.photos/seed/person3/100", // Placeholder profile image 3
            quote:
                "We loved every minute of our stay. The tranquil atmosphere and the stunning views provided the perfect getaway. The concierge service was outstanding, arranging everything we needed swiftly and professionally.",
        },
    ];

    return (
        <Container
            fluid
            style={{
                backgroundColor: "#f9f9f9",
                padding: "100px 0",
                textAlign: "center",
                position: "relative",
                height: "650px", // Increased height slightly to accommodate new image/text layout
            }}
        >
            <Container style={{ maxWidth: "900px" }}>
                <p
                    style={{
                        textTransform: "uppercase",
                        color: "var(--main-color)",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        marginBottom: "10px",
                    }}
                >
                    Testimonials
                </p>
                <h1
                    style={{
                        fontWeight: 700,
                        fontSize: "2.8rem",
                        marginBottom: "60px",
                        color: "#222",
                    }}
                >
                    What Our Customers Say?
                </h1>

                <Carousel
                    controls={true}
                    indicators={false}
                    interval={6000}
                    prevIcon={
                        <span
                            aria-hidden="true"
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "50%",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "#555",
                                border: "1px solid #ddd",
                            }}
                        >
                            <IoIosArrowRoundBack style={{ fontSize: "30px" }} />
                        </span>
                    }
                    nextIcon={
                        <span
                            aria-hidden="true"
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "50%",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                width: "45px",
                                height: "45px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "#555",
                                border: "1px solid #ddd",
                            }}
                        >
                            <IoIosArrowRoundForward style={{ fontSize: "30px" }} />
                        </span>
                    }
                    style={{
                        position: "relative",
                    }}
                >
                    {/* CSS to position controls far outside the container */}
                    <style>
                        {`
                        .carousel-control-prev {
                            left: -140px !important;
                        }
                        .carousel-control-next {
                            right: -140px !important;
                        }
                    `}
                    </style>

                    {testimonials.map((t, i) => (
                        <Carousel.Item key={i}>
                            <p
                                style={{
                                    fontSize: "1.1rem",
                                    color: "#555",
                                    lineHeight: "1.9",
                                    marginBottom: "30px",
                                    fontStyle: "italic", // Adding italic for better quote look
                                }}
                            >
                                "{t.quote}"
                            </p>
                            {/* Profile Picture */}
                            <img
                                src={t.image}
                                alt={t.name}
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginBottom: "20px",
                                }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    gap: "4px",
                                }}
                            >
                                <span style={{ color: "#f5b50a", fontSize: "1.3rem" }}>★★★★★</span>
                                <span style={{ fontWeight: "600", color: "#222" }}>
                                    - {t.name}
                                </span>
                                <span style={{ color: "#888", fontSize: "14px", marginTop: "5px" }}>
                                    Verified Guest
                                </span>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </Container>
        </Container>
    );
};

export default TestimonialsSection;