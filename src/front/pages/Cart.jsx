import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Cart() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        if (!store.token) return;
        fetch(`${BACKEND_URL}/api/cart`, {
            headers: { "Authorization": `Bearer ${store.token}` }
        })
            .then(res => res.json())
            .then(data => dispatch({ type: "SET_CART", payload: data }));
    }, [store.token]);

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) return;
        const res = await fetch(`${BACKEND_URL}/api/cart/${itemId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.token}`
            },
            body: JSON.stringify({ quantity })
        });
        if (res.ok) {
            const data = await res.json();
            dispatch({ type: "SET_CART", payload: data });
        }
    };

    const removeItem = async (itemId) => {
        const res = await fetch(`${BACKEND_URL}/api/cart/${itemId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${store.token}` }
        });
        if (res.ok) {
            const data = await res.json();
            dispatch({ type: "SET_CART", payload: data });
        }
    };

    const handleCheckout = async () => {
        const res = await fetch(`${BACKEND_URL}/api/orders`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${store.token}` }
        });
        if (res.ok) {
            dispatch({ type: "SET_CART", payload: [] });
            navigate("/order-confirmation");
        }
    };

    const total = store.cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    if (!store.token) {
        return (
            <div className="container py-5 text-center">
                <div style={{ fontSize: "5rem" }}>🔒</div>
                <h3 className="mt-3">Inicia sesión para ver tu carrito</h3>
                <Link to="/login" className="btn btn-warning btn-lg mt-3">Iniciar sesión</Link>
            </div>
        );
    }

    if (store.cart.length === 0) {
        return (
            <div className="container py-5 text-center">
                <div style={{ fontSize: "5rem" }}>🛒</div>
                <h3 className="mt-3">Tu carrito está vacío</h3>
                <p className="text-muted">Añade productos desde el catálogo</p>
                <Link to="/catalog" className="btn btn-dark btn-lg mt-3">Ver catálogo</Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="fw-bold mb-4">🛒 Tu carrito</h1>
            <div className="row g-4">

                {/* ITEMS */}
                <div className="col-lg-8">
                    {store.cart.map(item => (
                        <div className="card border-0 shadow-sm mb-3" key={item.id}>
                            <div className="card-body">
                                <div className="row align-items-center g-3">
                                    <div className="col-3 col-md-2">
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="img-fluid rounded"
                                            style={{ height: "70px", objectFit: "cover", width: "100%" }}
                                        />
                                    </div>
                                    <div className="col-9 col-md-4">
                                        <h6 className="fw-bold mb-1">{item.product.name}</h6>
                                        <span className="text-warning fw-bold">${item.product.price.toFixed(2)}</span>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="input-group input-group-sm">
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >−</button>
                                            <input
                                                type="number"
                                                className="form-control text-center"
                                                value={item.quantity}
                                                onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                    </div>
                                    <div className="col-4 col-md-2 text-end">
                                        <span className="fw-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="col-2 col-md-1 text-end">
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeItem(item.id)}
                                        >✕</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SUMMARY */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="fw-bold mb-4">Resumen del pedido</h5>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Envío</span>
                            <span className="text-success">{total >= 99 ? "Gratis" : "$9.99"}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-4">
                            <span className="fw-bold fs-5">Total</span>
                            <span className="fw-bold fs-5 text-warning">
                                ${(total >= 99 ? total : total + 9.99).toFixed(2)}
                            </span>
                        </div>
                        <button
                            className="btn btn-warning btn-lg w-100 fw-bold"
                            onClick={handleCheckout}
                        >
                            Confirmar pedido ✓
                        </button>
                        <Link to="/catalog" className="btn btn-outline-secondary w-100 mt-2">
                            Seguir comprando
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}