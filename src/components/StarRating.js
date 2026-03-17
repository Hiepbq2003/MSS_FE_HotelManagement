import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating, interactive = false }) => {
    return (
        <div className="d-flex align-items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <span 
                    key={star} 
                    onClick={() => interactive && setRating(star)}
                    style={{ 
                        cursor: interactive ? 'pointer' : 'default', 
                        color: star <= rating ? '#ffc107' : '#dee2e6', 
                        fontSize: interactive ? '1.8rem' : '1rem',
                        marginRight: '2px'
                    }}
                >
                    {star <= rating ? <FaStar /> : <FaRegStar />}
                </span>
            ))}
            {!interactive && <span className="ms-2 text-muted small">({rating}/5)</span>}
        </div>
    );
};

export default StarRating;