var Buffer = require("buffer/").Buffer;
global.Buffer = Buffer;
/* eslint-disable import/first */
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { ThemeProvider as MakeStylesProvider } from "@mui/material";
import theme from "theme";
import { SnackbarProvider } from "notistack";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const isTestnet = window.location.search.includes("testnet") || process.env.TESTNET === "1";
const manifestUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/tonconnect-manifest.json"
    : "https://minter.ton.org/tonconnect-manifest.json";

root.render(
  <RecoilRoot>
    <ThemeProvider theme={theme}>
      <MakeStylesProvider theme={theme}>
        <CssBaseline />
        <Router>
          <SnackbarProvider maxSnack={3}>
            <TonConnectUIProvider manifestUrl={manifestUrl} uiPreferences={{ theme: THEME.LIGHT }}>
              <App />
            </TonConnectUIProvider>
          </SnackbarProvider>
        </Router>
      </MakeStylesProvider>
    </ThemeProvider>
  </RecoilRoot>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
