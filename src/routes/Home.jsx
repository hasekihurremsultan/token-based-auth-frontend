import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { initialState, MainContext } from "../context/MainContext.jsx";
import Header from "../components/Header.jsx";
import { IoIosAddCircleOutline } from "react-icons/io";
import { TbEditCircle, TbEye, TbTrashX } from "react-icons/tb";
import toast from "react-hot-toast";
import "../progress-bar.css";
import ProgressBar from "../components/ProgressBar.jsx";
import axios from "axios";
import {TodoContext} from "../context/TodosContext.jsx";
import { useTodoActions } from "../hooks/todo.js";
import {MdOutlineCancel} from "react-icons/md";
import autoAnimate from "@formkit/auto-animate";

const Home = () => {

    const [session, setAuthState] = useContext(MainContext);
    const [todos, setTodos] = useContext(TodoContext);
    const inputRef = useRef(null);
    const authToken = session.accessToken;

    // Define all states
    const [loading, setLoading] = useState(false);
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [editingMode, setEditingMode] = useState(null);

    const titleRef = useRef(null);
    const descRef = useRef(null);
    const listRef = useRef(null);

    const navigate = useNavigate();
    const { $delete, update } = useTodoActions();

    const fetchTodos = async src => {
        setLoading(true);

        try {
            const { data } = await axios.get(import.meta.env.VITE_API_BASE_URL+"get-all-todos", {
                headers: { Authorization: `Bearer ${authToken}` },
                cancelToken: src.token
            });

            return setTodos(data);
        } catch (error) {
            if (typeof error.response.data.$refresh !== "undefined") {
                // Request a new access token
                try {
                    const { data } = await axios.post(import.meta.env.VITE_API_AUTH_URL+"access-token", { refreshToken: localStorage["refresh_token"] }, {
                        cancelToken: src.token
                    });

                    // Renew access token
                    sessionStorage.setItem("access_token", data.accessToken);
                    setAuthState({ ...session, accessToken: data.accessToken });

                } catch (error) {
                    // Clear all the auth state
                    sessionStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    setAuthState(initialState);

                    toast.error("Your session timed out, please login again.");
                    navigate("/login");
                }
            }
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Cleanup function to cancel any pending requests
        return () => {
            if (cancelTokenSource) {
                cancelTokenSource.cancel("Component unmounted!");
            }
        }
    }, []);

    useEffect(() => {
        if (session.isLoggedIn) {
            if (cancelTokenSource) cancelTokenSource.cancel("Request was cancelled.");
            const source = axios.CancelToken.source();

            setCancelTokenSource(source);
            fetchTodos(source);
        }

    }, [session]);

    useEffect(() => {
        parent.current && autoAnimate(parent.current);
    }, [listRef]);

    if (!session.isLoggedIn) {
        return (
            <main className="__container max-w-xl">
                <b>You are not signed in yet.</b>
                <div className="flex flex-col gap-2 mt-4">
                    <Link to="/login">~~ Login Page</Link>
                    <Link to="/register">~~Register Page</Link>
                </div>
                <Footer />
            </main>
        )
    }

    const addTodo = async event => {
        event.preventDefault();

        // Cancel any previous requests
        if (cancelTokenSource) {
            cancelTokenSource.cancel("Form submission cancelled!");
        }

        // Create a new cancellation token
        const source = axios.CancelToken.source();
        setCancelTokenSource(source);

        const { value } = inputRef.current;

        if (!value.trim().length > 0) {
            return toast.error("Please enter a title for todo.");
        }

        // Disable form component
        setLoading(true);

        try {
            const { data } = await axios.post(import.meta.env.VITE_API_BASE_URL+"new-todo", { title: value }, {
                cancelToken: source.token,
                headers: { Authorization: `Bearer: ${authToken}` }
            });

            toast.success(data.message);
            return fetchTodos(axios.CancelToken.source());

        } catch (error) {
            // Handle cancellation or other errors
            if (!axios.isCancel(error)) {
                return toast.error(error.response.data.message);
            }
            console.error("Form submission canceled!");
        } finally {
            setLoading(false);
            inputRef.current.value = "";
        }
    }

    return (
        <Fragment>
            <ProgressBar isLoading={loading} />
            <main className="__container">
                <Header />
                <div className="relative py-2 mt-2" aria-label="Add todo form">
                    {editingMode !== null ? <div className="white-overlay" /> : null}
                    <h1 className="font-bold text-xl tracking-tight text-black">✍️ Add new todo</h1>
                    <p className="text-sm md:text-base lg:text-lg text-gray-500 leading-5 md:leading-6 py-1 mt-1 mb-4 md:text-slate-600">
                        You can use form below to create a new todo, your todos will be stored in our database securely and{" "}
                        just you can show and interact with them.
                    </p>
                    <form onSubmit={addTodo} className={`flex flex-col md:flex-row gap-4 ${loading ? "opacity-40 pointer-events-none" : "opacity-100"} ${editingMode !== null ? "pointer-events-none" : ""}`}>
                        <input ref={inputRef} placeholder="What will you do today?" className="flex-1" disabled={loading} />
                        <button type="submit" className="no-prestyle w-full py-2.5 md:py-0 md:w-[245px] bg-emerald-950 text-emerald-50 rounded-2xl font-bold tracking-tight text-lg flex items-center justify-center gap-3 hover:bg-emerald-800 hover:shadow-xl transition focus-visible:scale-95 disabled:opacity-40">
                            <IoIosAddCircleOutline size={24} /> Add
                        </button>
                    </form>
                </div>
                <div className="pb-2 pt-4 mt-4 border-t" aria-label="List of todos">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold uppercase text-xs tracking-[1.75px] text-slate-500">List of todos</h3>
                        <small className="text-slate-700 monospaced">{todos.length > 0 ? `(${todos.length} items)` : null}</small>
                    </div>
                    {todos.length === 0 ? (
                        <div className="py-10 flex items-center justify-center gap-4">
                            <img src="/images/no-item.jpg" alt="No item illustration" className="h-[120px]" />
                            <div>
                                <h4 className="font-semibold text-lg text-slate-900 leading-6 mb-2">You have no todos at the moment.</h4>
                                <p className="text-slate-600 font-light text-sm leading-5">Please use the form above to create your first todo!</p>
                            </div>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-4 mt-4" ref={listRef}>
                            {todos.map(todo => {
                                let isEditing = !!(editingMode && editingMode._id === todo._id);

                                const exitEditMode = () => {
                                    titleRef.current.textContent = todo.title;
                                    if (descRef && descRef.current) {
                                        descRef.current.textContent = todo.description;
                                    }
                                    setEditingMode(null);
                                }

                                const updateTodo = () => {

                                    let payload = {
                                        t: titleRef.current.textContent,
                                        d: descRef && descRef.current ? descRef.current.textContent : null,
                                        i: todo._id
                                    }

                                    update(payload, () => {
                                        setEditingMode(null);
                                        fetchTodos(axios.CancelToken.source());
                                    });
                                }

                                return (
                                    <li className={`todo-item ${isEditing ? "edit-mode shadow-2xl scale-105" : ""}`} key={todo._id}>
                                        {editingMode !== null && !isEditing ? <div className="white-overlay" /> : null}
                                        <div className="border rounded-lg p-4 bg-white transition">
                                            {isEditing ? (
                                                <div className="flex justify-between items-center gap-2 mb-4">
                                                    <h3 className="font-bold text-lg text-amber-700">👾 You&apos;re in editing mode!</h3>
                                                    <span className="text-red-600 -mt-0.5 cursor-pointer" title="Exit edit mode" aria-label="Close" onClick={exitEditMode}>
                                                        <MdOutlineCancel size={24} />
                                                    </span>
                                                </div>
                                            ) : null}
                                            <h4 className={`text-sky-950 md:text-lg leading-6 font-semibold line-clamp-1 ${isEditing ? "dashed-border" : ""}`} contentEditable={isEditing} ref={isEditing ? titleRef : null}>{todo.title}</h4>
                                            {todo.description !== null ? <p className={`text-slate-500 mt-2 text-xs md:text-sm line-clamp-2 ${isEditing ? "dashed-border" : ""}`} contentEditable={isEditing} ref={isEditing ? descRef : null}>{todo.description}</p> : null}
                                            {isEditing ? <button className="bg-stone-950 text-stone-50 w-full py-2 rounded mt-4 font-semibold tracking-tight text-lg hover:bg-stone-800" onClick={updateTodo}>Save Changes</button> : null}
                                        </div>
                                        {!isEditing ? (
                                            <div className="absolute top-0 right-0 flex items-center px-4 gap-3 h-full min-w-[164px] -z-10">
                                                <button onClick={() => setEditingMode(todo) } className="bg-amber-400 border border-amber-700 text-amber-50 w-[36px] h-[36px] rounded-full cursor-pointer inline-flex items-center justify-center hover:bg-white hover:text-amber-700" title="Edit todo..">
                                                    <TbEditCircle size={20} />
                                                </button>
                                                <button className="bg-blue-500 border border-blue-700 text-blue-50 w-[36px] h-[36px] rounded-full cursor-pointer inline-flex items-center justify-center hover:bg-white hover:text-blue-700" title="View todo..">
                                                    <TbEye size={20} />
                                                </button>
                                                <button onClick={() => $delete(todo._id)} className="bg-red-500 border border-red-700 text-red-50 w-[36px] h-[36px] rounded-full cursor-pointer inline-flex items-center justify-center hover:bg-white hover:text-red-700" title="Delete todo..">
                                                    <TbTrashX size={20} />
                                                </button>
                                            </div>
                                        ) : null}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
                <Footer />
            </main>
        </Fragment>
    )
}

export default Home;