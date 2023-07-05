import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./routes/Home.jsx";
import LoginForm from "./routes/LoginForm.jsx";
import RegisterForm from "./routes/RegisterForm.jsx";
import { Toaster } from "react-hot-toast";
import { ContextProvider } from "./context/MainContext.jsx";
import {TodosProvider} from "./context/TodosContext.jsx";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <TodosProvider>
            <Home />
        </TodosProvider>
    },
    {
        path: "/login",
        element: <LoginForm />
    },
    {
        path: "/register",
        element: <RegisterForm />
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <ContextProvider>
          <Toaster position="bottom-center" />
          <RouterProvider router={routes} fallbackElement="Loading.." />
      </ContextProvider>
  </React.StrictMode>,
)
