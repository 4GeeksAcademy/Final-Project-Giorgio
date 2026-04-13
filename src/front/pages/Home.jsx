import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
	const { store, dispatch } = useGlobalReducer();

	useEffect(() => {
		fetch(`${BACKEND_URL}/api/products?featured=true`)
			.then(res => res.json())
			.then(data => dispatch({ type: "SET_PRODUCTS", payload: data }));

		fetch(`${BACKEND_URL}/api/categories`)
			.then(res => res.json())
			.then(data => dispatch({ type: "SET_CATEGORIES", payload: data }));
	}, []);

	return (
		<div>
			{/* HERO */}
			<section className="bg-dark text-white py-5">
				<div className="container py-5">
					<div className="row align-items-center">
						<div className="col-lg-6">
							<h1 className="display-4 fw-bold mb-3">
								⚡ La tecnología <br />
								<span className="text-warning">que necesitas</span>
							</h1>
							<p className="lead text-secondary mb-4">
								Smartphones, laptops, audio y gaming al mejor precio.
								Envío rápido y garantía incluida.
							</p>
							<Link to="/catalog" className="btn btn-warning btn-lg fw-bold px-5">
								Ver catálogo →
							</Link>
						</div>
						<div className="col-lg-6 text-center mt-4 mt-lg-0">
							<div style={{ fontSize: "10rem" }}>🖥️</div>
						</div>
					</div>
				</div>
			</section>

			{/* CATEGORIES */}
			<section className="py-5 bg-light">
				<div className="container">
					<h2 className="fw-bold mb-4 text-center">Explora por categoría</h2>
					<div className="row g-3 justify-content-center">
						{store.categories.map(cat => (
							<div className="col-6 col-md-4 col-lg-2" key={cat.id}>
								<Link
									to={`/catalog?category=${cat.slug}`}
									className="card text-center text-decoration-none h-100 border-0 shadow-sm"
								>
									<div className="card-body py-4">
										<div style={{ fontSize: "2rem" }}>
											{getCategoryEmoji(cat.slug)}
										</div>
										<p className="mb-0 fw-semibold text-dark mt-2">{cat.name}</p>
									</div>
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FEATURED PRODUCTS */}
			<section className="py-5">
				<div className="container">
					<h2 className="fw-bold mb-4 text-center">Productos destacados</h2>
					<div className="row g-4">
						{store.products.map(product => (
							<div className="col-sm-6 col-lg-3" key={product.id}>
								<Link to={`/product/${product.id}`} className="text-decoration-none">
									<div className="card h-100 border-0 shadow-sm">
										<img
											src={product.image_url}
											className="card-img-top"
											alt={product.name}
											style={{ height: "200px", objectFit: "cover" }}
										/>
										<div className="card-body">
											<h6 className="card-title text-dark fw-bold">{product.name}</h6>
											<p className="text-warning fw-bold fs-5 mb-0">
												${product.price.toFixed(2)}
											</p>
										</div>
									</div>
								</Link>
							</div>
						))}
					</div>
					<div className="text-center mt-5">
						<Link to="/catalog" className="btn btn-dark btn-lg px-5">
							Ver todos los productos
						</Link>
					</div>
				</div>
			</section>

			{/* BANNER */}
			<section className="bg-warning py-5">
				<div className="container text-center">
					<h2 className="fw-bold mb-2">🚀 Envío gratis en pedidos +$99</h2>
					<p className="mb-3">Garantía de 2 años en todos los productos. Pago 100% seguro.</p>
					<Link to="/catalog" className="btn btn-dark btn-lg px-5">Comprar ahora</Link>
				</div>
			</section>
		</div>
	);
}

function getCategoryEmoji(slug) {
	const map = {
		smartphones: "📱",
		laptops: "💻",
		audio: "🎧",
		gaming: "🎮",
		accessories: "🖱️",
	};
	return map[slug] || "📦";
}