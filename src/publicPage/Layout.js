import { Outlet, useLocation } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Layout = () => {
    const location = useLocation();

    // Ẩn Breadcrumbs trên trang chủ (tùy bạn)
    const hideBreadcrumb =
        location.pathname === "/" || location.pathname === "/home";
    return (
        <>
            <Header />
            <Breadcrumbs/>
            <Outlet /> 
            <Footer />
        </>
    );
};

export default Layout;
