import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.error || "Error al iniciar sesión");
            return;
        }

        dispatch({ type: "SET_TOKEN", payload: { token: data.token, user: data.user } });
        navigate("/");
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card border-0 shadow p-4">
                        <div className="text-center mb-4">
                            <div style={{ fontSize: "3rem" }}>⚡</div>
                            <h2 className="fw-bold">Iniciar sesión</h2>
                            <p className="text-muted">Bienvenido de nuevo a TechDrop</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2">{error}</div>
                        )}

                        <div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="tu@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button
                                className="btn btn-warning btn-lg w-100 fw-bold"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Entrando..." : "Iniciar sesión"}
                            </button>
                        </div>

                        <hr className="my-4" />
                        <p className="text-center mb-0">
                            ¿No tienes cuenta?{" "}
                            <Link to="/register" className="text-warning fw-bold">Regístrate</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}