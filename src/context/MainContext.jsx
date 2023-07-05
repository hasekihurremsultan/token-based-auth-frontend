import { createContext, useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import axios from "axios";

export const MainContext = createContext(null);

export const initialState = {
    isLoggedIn: false,
    accessToken: null,
    userData: {}
}

export const ContextProvider = ({ children }) => {

    const [authState, setAuthState] = useState(initialState);

    useEffect(() => {

        const STORED_ACCESS_TOKEN = sessionStorage.getItem("access_token");

        if (STORED_ACCESS_TOKEN) {
            // Set the authentication state from storage
            const {email, username} = jwtDecode(STORED_ACCESS_TOKEN);

            setAuthState({
                isLoggedIn: true,
                accessToken: STORED_ACCESS_TOKEN,
                userData: { email, username }
            });
        } else {
            // No access token, check for refresh token
            const STORED_REFRESH_TOKEN = localStorage.getItem("refresh_token");

            if (STORED_REFRESH_TOKEN) {
                // Send a request to the server to get a new access token using the refresh token

                const CancelToken = axios.CancelToken;
                const source = CancelToken.source();

                axios
                    .post(import.meta.env.VITE_API_AUTH_URL+"access-token", { refreshToken: STORED_REFRESH_TOKEN }, {
                        cancelToken: source.token
                    })
                    .then(response => {
                        const { accessToken } = response.data;
                        const { username, email } = jwtDecode(accessToken);

                        // Update the authentication state with the new access token
                        setAuthState({
                            isLoggedIn: true,
                            accessToken,
                            userData: { username, email }
                        });

                        // Save the new access token to sessionStorage
                        sessionStorage.setItem("access_token", accessToken);
                    })
                    .catch((error) => {
                        if (axios.isCancel(error)) {
                            console.error("Request canceled: ", error.message);
                        } else {
                            // Failed to get new access token
                            localStorage.removeItem("refresh_token");
                            window.location.href = "/login";
                        }
                    });

                return () => {
                    source.cancel('Request canceled due to component unmounting.');
                }
            }
        }

    }, [])

    return (
        <MainContext.Provider value={[authState, setAuthState]}>
            {children}
        </MainContext.Provider>
    )
}