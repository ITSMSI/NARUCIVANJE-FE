import React, { useState } from "react";
import Popup from "./ObrokPopup";

const Obrok = ({ obrok, selected, isSelectionAllowed, onSelect, grayOut,  onCancel }) => {
    const [showPopup, setShowPopup] = useState(false);
    const imageStyle = grayOut 
      ? { height: "250px", objectFit: "cover", filter: "grayscale(90%)" }
      : { height: "250px", objectFit: "cover" };

    return (
        <>
            <div className="card mb-5 mt-4 shadow-lg" style={{
                width: "22rem", borderRadius: "20px", overflow: "hidden", border: "none"}}>
                <img src={obrok.slika} className="card-img-top" alt={obrok.naziv} style={imageStyle}
                    onError={(e) => e.target.src = "/default-image.jpg"} />
                <div className="card-body">
                    <h5 className="card-title fw-bold mb-4 mt-2" style={{ color: "#212121", fontFamily: "Montserrat", fontSize: 22 }}>{obrok.naziv}</h5>
                    <hr className="mt-4" style={{ borderTop: "2px solid  #486F5B" }} />
                    <div className="d-flex " >
                        <button className="btn me-3 fw-bold w-50"
                            style={{ backgroundColor: "#CDDFD0", color: "#486F5B", fontFamily: "Montserrat", fontSize: 14 }}
                            onClick={() => setShowPopup(true)}>
                            Vidi detalje
                        </button>
                        <button className="btn fw-bold w-50"
                            style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 14 }}
                            disabled={!isSelectionAllowed()}
                            onClick={selected ? onCancel : () => onSelect(obrok)}>
                            {selected ? "Otkaži obrok" : "Izaberi obrok"}</button>
                    </div>
                </div>
            </div>

            {showPopup && <Popup obrok={obrok} onClose={() => setShowPopup(false)} />}
        </>
    );
}

export default Obrok;