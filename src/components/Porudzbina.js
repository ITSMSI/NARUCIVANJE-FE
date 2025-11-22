import React, { useState } from "react";
import Popup from "./ObrokPopup";

// Change this line to properly destructure the props
const Porudzbina = ({ porudzbina }) => {
    const [showPopup, setShowPopup] = useState(false);

    // Define a default image to use when obrokSlika is null or empty
    const defaultImage = "path/to/default-image.jpg"; // Replace with your default image path

    // Use the correct properties based on your API response
    const slikaUrl = porudzbina.obrokId
        ? `https://naruci.co.rs/api/v1/obrok/image/${porudzbina.obrokId}`
        : defaultImage;

    return (
        <>
            <div className="card mb-5 mt-4 shadow-lg" style={{ width: "22rem", borderRadius: "20px", overflow: "hidden", border: "none" }}>
                <img src={slikaUrl} className="card-img-top" alt={porudzbina.obrokNaziv} style={{ height: "250px", objectFit: "cover" }} />
                <div className="card-body">
                    <h5 className="card-title fw-bold mb-4 mt-2" style={{ color: "#212121", fontFamily: "Montserrat", fontSize: 22 }}>{porudzbina.obrokNaziv}</h5>
                    <hr className="mt-4" style={{ borderTop: "2px solid  #486F5B" }} />
                    <div className="d-flex ">
                        <button className="btn me-3 fw-bold w-50"
                            style={{ backgroundColor: "#CDDFD0", color: "#486F5B", fontFamily: "Montserrat", fontSize: 14 }}
                            onClick={() => setShowPopup(true)}>
                            Vidi detalje
                        </button>
                        <button className="btn fw-bold w-50"
                            style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 14 }}>
                            {porudzbina.datum}</button>
                    </div>
                </div>
            </div>

            {showPopup && <Popup 
                obrok={{
                    naziv: porudzbina.obrokNaziv,
                    opis: porudzbina.obrokOpis,
                    slika: slikaUrl,
                    id: porudzbina.obrokId
                }} 
                onClose={() => setShowPopup(false)} 
            />}
        </>
    );
}

export default Porudzbina;