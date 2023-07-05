import {createContext, useState} from "react";

export const TodoContext = createContext(null);

export const TodosProvider = ({ children }) => {
    const state = useState([]);

    return (
        <TodoContext.Provider value={state}>
            {children}
        </TodoContext.Provider>
    )
}