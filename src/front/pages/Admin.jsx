import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const emptyForm = {
    name: "", description: "", price: "", stock: "",
    image_url: "", is_featured: false, category_id: ""
};

export default function Admin() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!store.token || !store.user?.is_admin) {
            navigate("/");
            return;
        }
        loadProducts();
        fetch(`${BACKEND_URL}/api/categories`)
            .then(res => res.json())
            .then(data => dispatch({ type: "SET_CATEGORIES", payload: data }));
    }, [store.token]);

    const loadProducts = () => {
        fetch(`${BACKEND_URL}/api/products`)
            .then(res => res.json())
            .then(data => setProducts(data));
    };

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async () => {
        setError(null);
        if (!form.name || !form.price) {
            setError("Nombre y precio son obligatorios");
            return;
        }

        const payload = {
            ...form,
            price: parseFloat(form.price),
            stock: parseInt(form.stock) || 0,
            category_id: form.category_id ? parseInt(form.category_id) : null
        };

        const url = editingId
            ? `${BACKEND_URL}/api/products/${editingId}`
            : `${BACKEND_URL}/api/products`;
        const method = editingId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setSuccess(editingId ? "Producto actualizado" : "Producto creado");
            setForm(emptyForm);
            setEditingId(null);
            loadProducts();
            setTimeout(() => setSuccess(null), 3000);
        } else {
            const data = await res.json();
            setError(data.error || "Error al guardar");
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setForm({
            name: product.name,
            description: product.description || "",
            price: product.price,
            stock: product.stock,
            image_url: product.image_url || "",
            is_featured: product.is_featured,
            category_id: product.category?.id || ""
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
        const res = await fetch(`${BACKEND_URL}/api/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${store.token}` }
        });
        if (res.ok) {
            setSuccess("Producto eliminado");
            loadProducts();
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const handleCancel = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError(null);
    };

    return (
        <div className="container py-5">
            <h1 className="fw-bold mb-2">⚙️ Panel de administración</h1>
            <p className="text-muted mb-5">Gestiona el catálogo de productos de TechDrop</p>

            {/* FORM */}
            <div className="card border-0 shadow-sm p-4 mb-5">
                <h5 className="fw-bold mb-4">
                    {editingId ? "✏️ Editar producto" : "➕ Nuevo producto"}
                </h5>

                {error && <div className="alert alert-danger py-2">{error}</div>}
                {success && <div className="alert alert-success py-2">✅ {success}</div>}

                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Nombre *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Nombre del producto"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Precio ($) *</label>
                        <input
                            type="number"
                            name="price"
                            className="form-control"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            className="form-control"
                            value={form.stock}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label fw-semibold">Descripción</label>
                        <textarea
                            name="description"
                            className="form-control"
                            rows="2"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Descripción del producto"
                        />
                    </div>
                    <div className="col-md-8">
                        <label className="form-label fw-semibold">URL de imagen</label>
                        <input
                            type="text"
                            name="image_url"
                            className="form-control"
                            value={form.image_url}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Categoría</label>
                        <select
                            name="category_id"
                            className="form-select"
                            value={form.category_id}
                            onChange={handleChange}
                        >
                            <option value="">Sin categoría</option>
                            {store.categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                name="is_featured"
                                className="form-check-input"
                                id="is_featured"
                                checked={form.is_featured}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="is_featured">
                                Mostrar en productos destacados (Home)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                    <button className="btn btn-warning fw-bold px-4" onClick={handleSubmit}>
                        {editingId ? "Guardar cambios" : "Crear producto"}
                    </button>
                    {editingId && (
                        <button className="btn btn-outline-secondary px-4" onClick={handleCancel}>
                            Cancelar
                        </button>
                    )}
                </div>
            </div>

            {/* PRODUCTS TABLE */}
            <h5 className="fw-bold mb-3">📦 Productos ({products.length})</h5>
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Destacado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                                        />
                                    </td>
                                    <td className="fw-semibold">{product.name}</td>
                                    <td>
                                        <span className="badge bg-secondary">
                                            {product.category?.name || "—"}
                                        </span>
                                    </td>
                                    <td className="text-warning fw-bold">${product.price.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${product.stock > 0 ? "bg-success" : "bg-danger"}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>{product.is_featured ? "⭐" : "—"}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}