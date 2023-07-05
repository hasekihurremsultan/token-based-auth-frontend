import {Link, useNavigate} from "react-router-dom";
import Footer from "../components/Footer.jsx";
import {useContext, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {MainContext} from "../context/MainContext.jsx";
import jwtDecode from "jwt-decode";

const LoginForm = () => {

    const navigate = useNavigate();
    const [authState, setAuthState] = useContext(MainContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (authState.isLoggedIn) {
        toast.error("You are already logged in!");
        navigate("/");
        return null;
    }

    const handleSubmit = async event => {
        event.preventDefault();

        try {
            const { data } = await axios.post(import.meta.env.VITE_API_AUTH_URL+"login", { email, password });

            if (!data.success) {
                throw new Error("Unauthorized!");
            }

            const decodedToken = jwtDecode(data.accessToken);

            sessionStorage.setItem("access_token", data.accessToken);
            localStorage.setItem("refresh_token", data.refreshToken);

            setAuthState({
                isLoggedIn: true,
                accessToken: data.accessToken,
                userData: {
                    email: decodedToken.email,
                    username: decodedToken.username
                }
            })

            toast.success(data.message);
            return navigate("/");

        } catch (error) {
            if (error.response) {
                const { message, details } = error.response.data;
                toast.error(message + ": " + details);
            } else {
                toast.error("An error occurred. Please try again later.");
            }
        } finally {
            setPassword("");
        }
    }

    return (
        <main className="__container">
            <Link to="/" className="absolute top-9 left-6 text-xs underline uppercase font-semibold text-gray-400">{"<-- Homepage"}</Link>
            <h1 className="title">Login Form</h1>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" disabled={!email || !password}>Submit</button>
            </form>
            <div className="py-3 mt-4 text-center">Don&apos;t you have an account yet? <Link to="/register">Create one!</Link></div>
            <Footer className="text-center" />
        </main>
    )
}

export default LoginForm;