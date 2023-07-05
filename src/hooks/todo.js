import axios from "axios";
import toast from "react-hot-toast";
import {useContext} from "react";
import {TodoContext} from "../context/TodosContext.jsx";

export const useTodos = () => useContext(TodoContext)

async function deleteTodo(id, state) {
    const [todos, setTodos] = state;

    try {
        const { data } = await axios.delete(import.meta.env.VITE_API_BASE_URL + "delete-todo/" + id, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }
        });

        setTodos(todos.filter(todo => todo._id !== id));
        toast.success(data.message);

    } catch (e) {
        toast.error(e.response.data.message)
    }
}

async function updateTodo(payload, fn) {
    try {
        const { data } = await axios.put(import.meta.env.VITE_API_BASE_URL + "update-todo/" + payload.i, {
            title: payload.t,
            desc: payload.d,
            done: false
        }, { headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` } });

        toast.success(data.message);

    } catch (e) {
        toast.error(e.response.data.message);
    } finally {
        fn();
    }
}

export const useTodoActions = () => {
    const todoState = useTodos();

    return {
        $delete: (id) => deleteTodo(id, todoState),
        update: (data, resolver) => updateTodo(data, resolver)
    };
}