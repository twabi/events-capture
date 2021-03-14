import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "antd/dist/antd.css";
import "mdbreact/dist/css/mdb.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { init } from "d2";
import {BrowserRouter, HashRouter} from "react-router-dom";
import { Provider } from '@dhis2/app-runtime'

const basicAuth = "Basic " + btoa("ahmed:Atwabi@20");

const appConfig = {
    baseUrl: 'https://covmw.com/namistest/',
    apiVersion: 0,
    headers:{
        Authorization: basicAuth,
        "Content-Type": "application/json",
        withCredentials: true
    }
}

const developmentServer = "https://covmw.com/namistest/api/";
const withBaseUrl = (baseUrl) => {
    init({
        baseUrl: baseUrl,
        headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
            withCredentials: true
        },
    });
    ReactDOM.render(
        <Provider config={appConfig}>
            <HashRouter>
                <App/>
            </HashRouter>
        </Provider>
        , document.getElementById("root"));
};
withBaseUrl(developmentServer);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
