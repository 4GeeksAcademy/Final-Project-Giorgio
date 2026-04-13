import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ProductDetail() {
    const { id } = useParams();
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                dispatch({ type: "SET_CURRENT_PRODUCT", payload: data });
                setLoading(false);
            });
    }, [id]);

    const handleAddToCart = async () => {
        if (!store.token) {
            navigate("/login");
            return;
        }

        const res = await fetch(`${BACKEND_URL}/api/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.token}`
            },
            body: JSON.stringify({ product_id: parseInt(id), quantity })
        });

        if (res.ok) {
            const data = await res.json();
            dispatch({ type: "SET_CART", payload: data });
            setMessage("✅ Producto añadido al carrito");
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-warning" role="status"></div>
            </div>
        );
    }

    const product = store.currentProduct;
    if (!product) return null;

    return (
        <div className="container py-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/catalog">Catálogo</Link></li>
                    <li className="breadcrumb-item active">{product.name}</li>
                </ol>
            </nav>

            <div className="row g-5">
                {/* IMAGE */}
                <div className="col-lg-6">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="img-fluid rounded shadow"
                        style={{ width: "100%", maxHeight: "450px", objectFit: "cover" }}
                    />
                </div>

                {/* INFO */}
                <div className="col-lg-6">
                    {product.category && (
                        <span className="badge bg-secondary mb-3">{product.category.name}</span>
                    )}
                    <h1 className="fw-bold mb-2">{product.name}</h1>
                    <p className="text-warning fw-bold fs-2 mb-3">${product.price.toFixed(2)}</p>
                    <p className="text-muted mb-4">{product.description}</p>

                    <div className="mb-3">
                        {product.stock > 0 ? (
                            <span className="badge bg-success fs-6">✅ En stock ({product.stock} unidades)</span>
                        ) : (
                            <span className="badge bg-danger fs-6">❌ Agotado</span>
                        )}
                    </div>

                    {product.stock > 0 && (
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <label className="fw-semibold">Cantidad:</label>
                            <div className="input-group" style={{ width: "140px" }}>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                >−</button>
                                <input
                                    type="number"
                                    className="form-control text-center"
                                    value={quantity}
                                    min="1"
                                    max={product.stock}
                                    onChange={e => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                >+</button>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className="alert alert-success py-2">{message}</div>
                    )}

                    <div className="d-flex gap-3">
                        <button
                            className="btn btn-warning btn-lg fw-bold px-4"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            🛒 Añadir al carrito
                        </button>
                        <Link to="/catalog" className="btn btn-outline-secondary btn-lg">
                            ← Volver
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}