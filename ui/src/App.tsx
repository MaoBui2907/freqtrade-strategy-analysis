import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Backtesting from "./components/Backtesting";
import Strategies from "./components/Strategies";
import "./App.scss";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import PairGroups from "./components/PairGroups";
import StrategyDetail from "./components/StrategyDetail";
import Helper from "./components/Helper";

function App() {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Header />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Navigate to="/strategies" />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/strategies/:strategyId" element={<StrategyDetail />} />
              <Route path="/pair-groups" element={<PairGroups />} />
              <Route path="/backtesting" element={<Backtesting />} />
              <Route path="/helper" element={<Helper />} />
              <Route path="*" element={<div>Not Found</div>} />
            </Routes>
          </div>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
