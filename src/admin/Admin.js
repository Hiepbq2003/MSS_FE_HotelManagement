import React from 'react';
import { Row, Col } from 'react-bootstrap'
import {Outlet} from "react-router-dom";
import Sidebar from '../adminArea/Sidebar';
const Admin = () => {
    return (
        <div>
            <Row className="d-flex">
                <Col lg={2}>
                <Sidebar role="ADMIN" />
                </Col>
                <Col lg={10}>
                    <Outlet />
                </Col>
            </Row>
        </div>
    );
};

export default Admin;
