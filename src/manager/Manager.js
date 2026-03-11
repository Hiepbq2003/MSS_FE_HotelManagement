import React from 'react';
import { Row, Col } from 'react-bootstrap'
import {Outlet} from "react-router-dom";
import Sidebar from '../adminArea/Sidebar'; // Sidebar dùng chung

const Manager = () => {
    return (
        <div>
            <Row className="d-flex">
                <Col lg={2}>
                    <Sidebar role="MANAGER" /> 
                </Col>
                <Col lg={10}>
                    <Outlet />
                </Col>
            </Row>
        </div>
    );
};

export default Manager;