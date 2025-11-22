import React from "react";
import NavBar from "../components/NavBar";

const NePostojiPage = () => {
    return (
        <div >
            <NavBar />
            <div className="container text-center mt-4 ">
                <h2 className="fw-bold mb-3" style={{ color: "#424242", fontFamily: "Montserrat", fontSize: 32 }}>Ova stanica ne postoji</h2>
                <p style={{ color: "#757575", fontSize: 18, fontFamily: "Montserrat"}}>Izaberite postojeću rutu.</p>
            </div>
        </div >
    );
};

export default NePostojiPage;