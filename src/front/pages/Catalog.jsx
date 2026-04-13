import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Catalog() {
    const { store, dispatch } = useGlobalReducer();
    const [searchParams, setSearchParams] = useSearchParams();
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState("");

    const categorySlug = searchParams.get("category") || "";

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/categories`)
            .then(res => res.json())
            .then(data => dispatch({ type: "SET_CATEGORIES", payload: data }));
    }, []);

    useEffect(() => {
        let url = `${BACKEND_URL}/api/products?`;
        if (categorySlug) url += `category=${categorySlug}&`;
        if (minPrice) url += `min_price=${minPrice}&`;
        if (maxPrice) url += `max_price=${maxPrice}&`;
        if (sort) url += `sort=${sort}&`;

        fetch(url)
            .then(res => res.json())
            .then(data => dispatch({ type: "SET_PRODUCTS", payload: data }));
    }, [categorySlug, minPrice, maxPrice, sort]);

    const handleCategoryClick = (slug) => {
        if (slug === categorySlug) {
            setSearchParams({});
        } else {
            setSearchParams({ category: slug });
        }
    };

    return (
        <div className="container py-5">
            <h1 className="fw-bold mb-4">Catálogo de productos</h1>
            <div className="row g-4">

                {/* SIDEBAR */}
                <div className="col-lg-3">
                    <div className="card border-0 shadow-sm p-3 mb-4">
                        <h6 className="fw-bold mb-3">Categorías</h6>
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2">
                                <button
                                    className={`btn btn-sm w-100 text-start ${categorySlug === "" ? "btn-dark" : "btn-outline-secondary"}`}
                                    onClick={() => setSearchParams({})}
                                >
                                    Todas
                                </button>
                            </li>
                            {store.categories.map(cat => (
                                <li className="mb-2" key={cat.id}>
                                    <button
                                        className={`btn btn-sm w-100 text-start ${categorySlug === cat.slug ? "btn-dark" : "btn-outline-secondary"}`}
                                        onClick={() => handleCategoryClick(cat.slug)}
                                    >
                                        {cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card border-0 shadow-sm p-3 mb-4">
                        <h6 className="fw-bold mb-3">Precio</h6>
                        <div className="mb-2">
                            <label className="form-label small">Mínimo ($)</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="form-label small">Máximo ($)</label>
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                placeholder="9999"
                            />
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm p-3">
                        <h6 className="fw-bold mb-3">Ordenar por</h6>
                        <select
                            className="form-select form-select-sm"
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                        >
                            <option value="">Relevancia</option>
                            <option value="price_asc">Precio: menor a mayor</option>
                            <option value="price_desc">Precio: mayor a menor</option>
                        </select>
                    </div>
                </div>

                {/* PRODUCTS GRID */}
                <div className="col-lg-9">
                    <p className="text-muted mb-3">{store.products.length} productos encontrados</p>
                    {store.products.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: "4rem" }}>😕</div>
                            <h5 className="mt-3">No se encontraron productos</h5>
                            <p className="text-muted">Prueba con otros filtros</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {store.products.map(product => (
                                <div className="col-sm-6 col-xl-4" key={product.id}>
                                    <Link to={`/product/${product.id}`} className="text-decoration-none">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <img
                                                src={product.image_url}
                                                className="card-img-top"
                                                alt={product.name}
                                                style={{ height: "180px", objectFit: "cover" }}
                                            />
                                            <div className="card-body">
                                                <span className="badge bg-secondary mb-2">
                                                    {product.category?.name}
                                                </span>
                                                <h6 className="card-title text-dark fw-bold">{product.name}</h6>
                                                <p className="text-muted small mb-2" style={{ 
                                                    overflow: "hidden", 
                                                    display: "-webkit-box", 
                                                    WebkitLineClamp: 2, 
                                                    WebkitBoxOrient: "vertical" 
                                                }}>
                                                    {product.description}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="text-warning fw-bold fs-5">
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                    <span className={`badge ${product.stock > 0 ? "bg-success" : "bg-danger"}`}>
                                                        {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}