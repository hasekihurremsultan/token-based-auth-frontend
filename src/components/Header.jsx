import {useContext} from "react";
import {initialState, MainContext} from "../context/MainContext.jsx";
import {useNavigate} from "react-router-dom";
import {IoMdLogOut} from "react-icons/io";

const Header = () => {

    const [session, setAuthSession] = useContext(MainContext);
    const navigate = useNavigate();

    const logOut = () => {
        setAuthSession(initialState);

        // Clear the browser storage
        sessionStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
    }

    return (
        <header className="flex justify-between items-center border-b pb-4">
            <div className="inline-flex flex-col">
                <span className="leading-5">Signed in as <b>@{session.userData.username}</b></span>
                <small className="leading-4 text-xs text-gray-500 italic">({session.userData.email})</small>
            </div>
            <button onClick={logOut} className="px-3 py-1.5 border border-red-500 rounded-md text-xs text-red-500 bg-white select-none hover:bg-red-500 hover:text-red-50 transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap">
                <IoMdLogOut size={18} /> Log Out
            </button>
        </header>
    )
}

export default Header;