import { createBrowserRouter } from "react-router";
import Landing from "../features/landing/pages/Landing";
import Login from "../features/auth/pages/login";
import Register from "../features/auth/pages/register";
import Dashboard from "../features/chat/pages/Dashboard";
import Protected from "../features/auth/components/Protected";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/dashboard",
        element: (
            <Protected>
                <Dashboard />
            </Protected>
        )
    }
])