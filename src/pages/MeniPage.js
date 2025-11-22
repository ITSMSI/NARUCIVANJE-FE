import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Obrok from "../components/Obrok";
import { jwtDecode } from "jwt-decode";

const MeniPage = () => {
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const [selectedDate, setSelectedDate] = useState("");
    const [obroci, setObroci] = useState([]);
    const [meniDostupan, setMeniDostupan] = useState(true);
    const [porudzbina, setPorudzbina] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelComment, setCancelComment] = useState("");

    const today = new Date();
    today.setDate(today.getDate() + 1); // Sutrašnji datum
    const minDate = today.toISOString().split("T")[0];

    const isSelectionAllowed = () => {
        const now = new Date();
        const currentHour = now.getHours(); // Dobijamo trenutno vreme u satima

        // Proveravamo da li korisnik bira obrok za sutrašnji datum
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

        return !(selectedDate === tomorrowFormatted && currentHour >= 12);
    };

    useEffect(() => {
        if (selectedDate) {
            fetchPorudzbina();
            fetchMeni();
        }
    }, [selectedDate]);

    const fetchMeni = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8080/api/v1/meni/get/datum?datum=${selectedDate}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 404) {
                setObroci([]); // Ako meni ne postoji u bazi
                setMeniDostupan(false);
            } else if (!response.ok) {
                throw new Error("Greška pri učitavanju menija.");
            } else {
                const result = await response.json();
                // Since our API returns a single menu (or an object), wrap it in an array if needed
                const menus = Array.isArray(result) ? result : [result];
                const active = menus.filter(meni => meni.status === true);
                // Extract the "obroci" from each menu and flatten them into one array
                const sviObroci = active.flatMap((meni) => meni.obroci || []).map((obrok) => ({
                    ...obrok,
                    slikaUrl: `http://127.0.0.1:8080/api/v1/obrok/image/${obrok.id}`, // Generišemo URL do slike
                }));
                setObroci(sviObroci);
                setMeniDostupan(sviObroci.length > 0);
            }
        } catch (error) {
            console.error("Greška pri učitavanju menija:", error);
            setMeniDostupan(false);
        }
    };

    const fetchPorudzbina = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8080/api/v1/porudzbina/get/user/${decodedToken.id}/date-range?startDate=${selectedDate}&endDate=${selectedDate}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                const data = await response.json();

                setPorudzbina(data.length > 0 ? data[0] : null)
            } else {
                setPorudzbina(null);
            }
        } catch (error) {
            console.error("Greška pri proveri porudžbine:", error);
            setPorudzbina(null);
        }
    };

    const handleSelectObrok = async (obrok) => {

        if (porudzbina) {
            await fetch(
                `http://127.0.0.1:8080/api/v1/porudzbina/update/${porudzbina.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: decodedToken.id,
                        datum: selectedDate,
                        obrokId: obrok.id,
                    }),
                }
            );
        } else {
            await fetch("http://127.0.0.1:8080/api/v1/porudzbina/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: decodedToken.id,
                    datum: selectedDate,
                    obrokId: obrok.id,
                    lastModById: decodedToken.id,
                }),
            });
        }
        fetchPorudzbina();
    };

    const handleCancelOrder = async () => {
        if (porudzbina.status === false) return;

        await fetch(
            `http://127.0.0.1:8080/api/v1/porudzbina/remove/${porudzbina.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: decodedToken.id,
                    datum: selectedDate,
                    komentar: cancelComment,
                }),
            }
        );
        setShowCancelModal(false);
        fetchPorudzbina();
    };

    
    const grayOut = (obrok) =>{
        return porudzbina !== null && porudzbina?.status==true && porudzbina?.obrokId !== null && obrok.id !== porudzbina?.obrokId;
    }

    return (
        <div>
            <NavBar />
            <div className="container mt-4 ">
                <p
                    className="text-center fw-bold mt-5"
                    style={{
                        fontFamily: "Montserrat",
                        fontSize: 16,
                        color: "#486F5B",
                    }}
                >
                    Izaberite obrok za datum:
                </p>
                <input
                    type="date"
                    className="form-control w-25 mx-auto"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
                {selectedDate && !meniDostupan ? (
                    <p
                        className="text-danger fw-bold text-center"
                        style={{
                            fontSize: "30px",
                            fontFamily: "Montserrat",
                            marginTop: 100,
                        }}
                    >
                        Meni za odabrani datum još uvek nije dostupan.
                    </p>
                ) : (
                    <div className="row mt-5">
                        {obroci.map((obrok, index) => (
                            <div
                                key={index}
                                className="col-md-4 d-flex justify-content-center">
                                <Obrok
                                    obrok={{
                                        id: obrok.id,
                                        naziv: obrok.naziv,
                                        opis: obrok.opis,
                                        slika: obrok.slikaUrl, 
                                    }}
                                    selected={porudzbina?.obrokId === obrok.id && porudzbina?.status === true}
                                    isSelectionAllowed={isSelectionAllowed} // Sprečava odabir ako je prošlo 12 PM
                                    onSelect={ handleSelectObrok} 
                                    grayOut={ grayOut(obrok)}
                                    onCancel={ () => setShowCancelModal(true)
                                    } 
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showCancelModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowCancelModal(false)}
                >
                    <div
                        className="modal-content align-items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            className="fw-bold mb-5"
                            style={{
                                fontFamily: "Montserrat",
                                fontSize: 24,
                                color: "white",
                            }}
                        >
                            Otkazivanje obroka
                        </h2>
                        <textarea
                            className="w-75 mb-3"
                            placeholder="Unesite razlog..."
                            value={cancelComment}
                            onChange={(e) =>
                                setCancelComment(e.target.value)
                            }
                        />
                        <button
                            className="btn mb-3 w-75 fw-bold"
                            style={{
                                backgroundColor: cancelComment.trim() === "" ? "#d3d3d3" : "#CDDFD0",
                                fontFamily: "Montserrat",
                                fontSize: 16,
                                color: "#486F5B",
                                cursor: cancelComment.trim() === "" ? "not-allowed" : "pointer"
                            }}
                            onClick={handleCancelOrder}
                            disabled={cancelComment.trim() === ""}
                        >
                            Potvrdi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeniPage;
