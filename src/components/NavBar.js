import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const NavBar = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [decodedToken, setDecodedToken] = useState(token ? jwtDecode(token) : null);

    useEffect(() => {
        if (token) {
            setDecodedToken(jwtDecode(token));
        } else {
            setDecodedToken(null);
        }
    }, [token]); // ✅ Ažurira se kad se token promeni

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);  // ✅ Ovo osvežava navbar i sakriva admin meni
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg sticky-top shadow" style={{ backgroundColor: "#486F5B" }}>
            <div className="container-fluid d-flex align-items-center ">
                {/* Logo */}
                <div className="d-flex align-items-center" style={{ flex: "1" }}>
                    <img src="/slike/logo.png" alt="Logo" style={{ height: "80px", marginLeft: "60px" }} />
                </div>


                {/* Dugmad menija */}
                <div className="d-flex align-items-center flex-wrap" style={{ flex: "2", justifyContent: "flex-end", gap: "15px"}}>
                    {decodedToken ? (
                        <>
                            <span className="text-white me-5 fw-bold " style={{ fontFamily: "Montserrat", fontSize: 16 }}>
                                Dobrodošli, {decodedToken.ime}
                            </span>
                            {decodedToken.role === "ROLE_ADMIN" ? (
                                <>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/admin")}>Pregled</button>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/admin/obroci")}>Obrok</button>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/admin/meniji")}>Meni</button>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/admin/korisnici")}>Korisnici</button>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/admin/role")}>Role</button>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/admin/kompanije")}>Kompanija</button>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/admin/lokacije")}>Lokacija</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/pregled")}>Pregled</button>
                                    <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                        onClick={() => navigate("/meni")}>Meni</button>
                                </>
                            )}
                            <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                                onClick={handleLogout}>Odjavi se</button>
                        </>
                    ) : (
                        <button className="btn text-white" style={{ fontFamily: "Montserrat", fontSize: 16 }}
                            onClick={() => navigate("/login")}>
                            Prijavi se
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;