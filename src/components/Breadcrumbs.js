import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x).map(segment => {
        if (!isNaN(segment) && segment.trim() !== "") {
            return "Details"; 
        }
        return segment;
    });
    
    if (pathnames.length === 0) return null;

    return (
        <Breadcrumb 
            className='my-4 p-3 rounded-lg shadow-sm' 
            style={{ 
                '--bs-breadcrumb-divider': "'>'",
                fontSize: '0.95rem',
      
                background: 'linear-gradient(90deg, #e1ecf7ff 0%, #7171c7ff 100%)', 
                border: '1px solid #dcdcdc',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}
        >
            <Breadcrumb.Item 
                linkAs={Link} 
                linkProps={{ to: '/' }}
                className='text-dark fw-bold'
            >
                🏠 Home
            </Breadcrumb.Item>
            {pathnames.map((name, index) => {
                const routeTo = '/' + location.pathname.split('/').filter((x) => x).slice(0, index + 1).join('/');
                const isLast = index === pathnames.length - 1;

                return isLast ? (
                    <Breadcrumb.Item 
                        active 
                        key={name}
                        className='fw-bold'
                        style={{ color: 'green' }}
                    >
                        {capitalize(name)}
                    </Breadcrumb.Item>
                ) : (
                    <Breadcrumb.Item 
                        linkAs={Link} 
                        linkProps={{ to: routeTo }} 
                        key={name}
                        className='text-secondary'
                    >
                        {capitalize(name)}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
};

export default Breadcrumbs;