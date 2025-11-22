import React from "react";

const ObrokPopup = ({ obrok, onClose }) => {
    return (
        <div className="position-fixed top-50 start-50 translate-middle bg-white shadow-lg " 
            style={{ width: "800px", height: "620px", maxWidth: "90%", borderRadius: "20px", overflow: "hidden", zIndex: 1050, display: "flex", flexDirection: "column" }}>
            
        
            
            {/* Slika obroka */}
            <div style={{ flex: "1", position: "relative" }}>
                <img src={obrok.slika} alt={obrok.naziv} className="img-fluid" 
                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
            </div>

            {/* Zatvaranje Popup-a */}
            <button className="btn-close position-absolute top-0 end-0 m-3" 
            style={{ filter: "invert(1)", opacity: "1", fontSize: "2rem"}} onClick={onClose}></button>

            {/* Zamagljeni deo preko slike */}
            <div className="position-absolute bottom-0 w-100 p-4" 
                style={{ background: "rgba(0, 0, 0, 0.1)", backdropFilter: "blur(15px)", color: "white" }}>
                <h3 className="fw-bold" style={{ fontFamily: "Montserrat", fontSize: 30}}>{obrok.naziv}</h3>
                <p style={{ fontSize: "18px", marginBottom: 50, fontFamily: "Montserrat"}}>{obrok.opis}</p>
            </div>
        </div>
    );
}

export default ObrokPopup;