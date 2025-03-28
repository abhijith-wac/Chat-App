import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Chat from "./pages/Chat";
import { userAtom } from "./atoms/authAtom";
import { useAtom } from "jotai";
import Home from "./pages/Home";

const App = () => {
  const [user] = useAtom(userAtom); // Get user authentication state

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Protected Route */}
        <Route
          path="/mainchatpage"
          element={user ? <MainLayout /> : <Navigate to="/" />}
        >
          {/* Default page inside MainLayout (home screen) */}
          <Route index element={<Home />} />

          {/* Dynamic chat route */}
          <Route path="chat/:userId" element={<Chat />} />
        </Route>
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
