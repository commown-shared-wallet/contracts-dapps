/*
 * * React Utils
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

/*
 * * Mantine UI Library
 */
import { NotificationsProvider } from "@mantine/notifications";

/*
 * *  Wallet && Blockchain interaction
 */
import { Web3ReactProvider } from "@web3-react/core";
import getLibrary from "utils/getLibrary";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Web3ReactProvider getLibrary={getLibrary}>
            <ToastContainer />
            <NotificationsProvider>
                <Router>
                    <App />
                </Router>
            </NotificationsProvider>
        </Web3ReactProvider>
    </React.StrictMode>
);
