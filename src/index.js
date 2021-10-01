import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

import App from "./app";
import reset from "./constants/css/reset";
import "./css/styles.css";

const GlobalStyle = createGlobalStyle`${reset}`;

ReactDOM.render(
    <BrowserRouter>
        <Fragment>
            <App />
            <GlobalStyle />
        </Fragment>
    </BrowserRouter>,
    document.getElementById("root")
);
