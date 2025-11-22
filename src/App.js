
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LozinkaPage from "./pages/LozinkaPage";
import PromenaLozinke from "./pages/PromenaLozinke";
import MeniPage from "./pages/MeniPage";
import PregledPage from "./pages/PregledPage";
import AdminPregled from "./pages/AdminPregled";
import AdminKorisnici from "./pages/AdminKorisnici";
import AdminMeniji from "./pages/AdminMeniji";
import AdminObroci from "./pages/AdminObroci";
import AdminRole from "./pages/AdminRole";
import AdminLokacije from "./pages/AdminLokacije";
import AdminKompanije from "./pages/AdminKompanije";
import NotAuthorizedPage from "./pages/NotAuthorizedPage";
import NePostojiPage from "./pages/NePostojiPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    } else {
      setUserRole("");
    }
  }, [token]);

  const updateToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage updateToken={updateToken}/>} />
          <Route path="/lozinka" element={<LozinkaPage />} />
          <Route path="/reset-password" element={<PromenaLozinke />} />
          <Route path="/meni" element={<ProtectedRoute allowedRoles={['ROLE_USER']} userRole={userRole}><MeniPage /></ProtectedRoute>} />
          <Route path="/pregled" element={<ProtectedRoute allowedRoles={['ROLE_USER']} userRole={userRole}><PregledPage /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} userRole={userRole}><AdminPregled /></ProtectedRoute>} />
          <Route path="/admin/meniji" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} userRole={userRole}><AdminMeniji /></ProtectedRoute>} />
          <Route path="/admin/obroci" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} userRole={userRole}><AdminObroci /></ProtectedRoute>} />
          <Route path="/admin/role" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} userRole={userRole}><AdminRole /></ProtectedRoute>} />
          <Route path="/admin/korisnici" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} userRole={userRole}><AdminKorisnici /></ProtectedRoute>} />
          <Route path="/admin/lokacije" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} userRole={userRole}><AdminLokacije /></ProtectedRoute>} />
          <Route path="/admin/kompanije" element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} userRole={userRole}><AdminKompanije /></ProtectedRoute>} />

          {/* Ruta za Not Authorized */}
          <Route path="/not-authorized" element={<NotAuthorizedPage />} />

          {/* Fallback ruta za nepostojeće stranice */}
          <Route path="*" element={<NePostojiPage />} />
        
        </Routes>
      </Router>
    </div>
  );
}

export default App;
