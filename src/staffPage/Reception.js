import React from 'react';
import { Row, Col } from 'react-bootstrap'
import {Outlet} from "react-router-dom";
import ReceptionSidebar from './ReceptionSidebar';
const Reception = () => {
    return (
        <div>
            <Row className="d-flex">
                <Col lg={2}>
                    <ReceptionSidebar />
                </Col>
                <Col lg={10}>
                    <Outlet />
                </Col>
            </Row>
        </div>
    );
};

export default Reception;