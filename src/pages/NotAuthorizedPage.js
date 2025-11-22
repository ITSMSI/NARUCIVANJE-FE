import React from "react";
import NavBar from "../components/NavBar";

const NotAuthorizedPage = () => {
    return (
        <div >
            <NavBar />
            <div className="container text-center mt-5 ">
                <h2 className="fw-bold mb-3" style={{ color: "#424242", fontFamily: "Montserrat", fontSize: 32 }}>Nemate pristup ovoj stranici</h2>
                <p style={{ color: "#757575", fontSize: 18, fontFamily: "Montserrat" }}>
                    Nažalost, morate se prijaviti da biste imali pristup ovoj stranici.
                </p>
            </div>
        </div>
    );
};

export default NotAuthorizedPage;