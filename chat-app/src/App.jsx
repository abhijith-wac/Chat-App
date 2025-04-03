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
  const [user] = useAtom(userAtom); 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/mainchatpage"
          element={user ? <MainLayout /> : <Navigate to="/" />}
        >
          <Route index element={<Home />} />

          <Route path="chat/:userId" element={<Chat />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
