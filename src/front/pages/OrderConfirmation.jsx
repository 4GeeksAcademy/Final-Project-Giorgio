import { Link } from "react-router-dom";

export default function OrderConfirmation() {
    return (
        <div className="container py-5 text-center">
            <div style={{ fontSize: "6rem" }}>🎉</div>
            <h1 className="fw-bold mt-3">¡Pedido confirmado!</h1>
            <p className="lead text-muted mt-2 mb-4">
                Gracias por tu compra. Tu pedido ha sido procesado correctamente.
            </p>
            <div className="card border-0 shadow-sm d-inline-block px-5 py-4 mb-5">
                <p className="mb-1 text-muted">Estado del pedido</p>
                <span className="badge bg-success fs-6 px-3 py-2">✅ Completado</span>
            </div>
            <div className="d-flex justify-content-center gap-3">
                <Link to="/catalog" className="btn btn-warning btn-lg fw-bold px-5">
                    Seguir comprando
                </Link>
                <Link to="/" className="btn btn-outline-secondary btn-lg px-5">
                    Ir al inicio
                </Link>
            </div>
        </div>
    );
}