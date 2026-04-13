import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";

export default function Layout() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <ScrollToTop />
            <Navbar />
            <main className="flex-grow-1">
                <Outlet />
            </main>
            <footer className="bg-dark text-light text-center py-3 mt-auto">
                <small>© 2026 TechDrop — Tu tienda de tecnología</small>
            </footer>
        </div>
    );
}