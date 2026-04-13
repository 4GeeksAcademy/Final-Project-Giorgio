import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Register() {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);

        if (form.password !== form.confirm) {
            setError("Las contraseñas no coinciden");
            return;
        }
        if (form.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.error || "Error al registrarse");
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
                            <h2 className="fw-bold">Crear cuenta</h2>
                            <p className="text-muted">Únete a TechDrop hoy</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2">{error}</div>
                        )}

                        <div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Tu nombre"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
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
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Mínimo 6 caracteres"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    name="confirm"
                                    className="form-control"
                                    placeholder="Repite tu contraseña"
                                    value={form.confirm}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button
                                className="btn btn-warning btn-lg w-100 fw-bold"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Creando cuenta..." : "Crear cuenta"}
                            </button>
                        </div>

                        <hr className="my-4" />
                        <p className="text-center mb-0">
                            ¿Ya tienes cuenta?{" "}
                            <Link to="/login" className="text-warning fw-bold">Inicia sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}