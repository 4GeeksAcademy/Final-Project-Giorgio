import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Navbar() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/");
    };

    const cartCount = store.cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div className="container">
                <Link className="navbar-brand fw-bold fs-4" to="/">
                    ⚡ TechDrop
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/catalog">Catálogo</Link>
                        </li>
                        {store.user?.is_admin && (
                            <li className="nav-item">
                                <Link className="nav-link text-warning" to="/admin">Admin</Link>
                            </li>
                        )}
                    </ul>

                    <ul className="navbar-nav align-items-center gap-2">
                        <li className="nav-item">
                            <Link className="nav-link position-relative" to="/cart">
                                🛒
                                {cartCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </li>

                        {store.token ? (
                            <>
                                <li className="nav-item">
                                    <span className="nav-link text-light">Hola, {store.user?.name}</span>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                                        Cerrar sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-warning btn-sm fw-bold" to="/register">Registro</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}