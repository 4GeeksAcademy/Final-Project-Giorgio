import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import OrderConfirmation from "./pages/OrderConfirmation";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/catalog", element: <Catalog /> },
            { path: "/product/:id", element: <ProductDetail /> },
            { path: "/cart", element: <Cart /> },
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
            { path: "/admin", element: <Admin /> },
            { path: "/order-confirmation", element: <OrderConfirmation /> },
        ]
    }
]);