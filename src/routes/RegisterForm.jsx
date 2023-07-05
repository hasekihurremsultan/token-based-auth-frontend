import {Link, useNavigate} from "react-router-dom";
import Footer from "../components/Footer.jsx";
import {useContext, useState} from "react";
import toast from "react-hot-toast";
import {MainContext} from "../context/MainContext.jsx";
import axios from "axios";

const RegisterForm = () => {

    const navigate = useNavigate();
    const [authState] = useContext(MainContext);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (authState.isLoggedIn) {
        toast.error("Sign out before creating a new account!");
        navigate("/");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(import.meta.env.VITE_API_AUTH_URL+"register", {
                username,
                email,
                password,
            });

            if (response.data.success) {
                console.log("Registration successful!");
                toast.success(response.data.message);
                // Redirect to the login page after successful registration
                navigate("/login");
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("Registration failed:", error);
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            // Reset the form fields after submission
            setPassword("");
        }
    };

    return (
        <main className="__container">
            <Link to="/" className="absolute top-9 left-6 text-xs underline uppercase font-semibold text-gray-400">{"<-- Homepage"}</Link>
            <h1 className="title">Register Form</h1>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
                <button type="submit">Submit</button>
            </form>
            <div className="py-3 mt-4 text-center">Already have an account? <Link to="/login">Sign In</Link></div>
            <Footer className="text-center" />
        </main>
    )
}

export default RegisterForm;