import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Porudzbina from "../components/Porudzbina";
import { jwtDecode } from "jwt-decode";

const PregledPage = () => {
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [porudzbine, setPorudzbine] = useState([]);
    const [porudzDostupne, setPorudzDostupne] = useState(true);

    const [errorMsg, setErrorMsg] = useState("");

    const handleDateChange = (e, type) => {
        const newDate = e.target.value;

        if (type === "start") {
            setStartDate(newDate);
            setEndDate(""); // Resetujemo endDate ako menjamo start
        } else {
            const start = new Date(startDate);
            const end = new Date(newDate);
            const difference = (end - start) / (1000 * 60 * 60 * 24); // Razlika u danima

            if (difference > 7) {
                setErrorMsg("Možete pretraživati porudžbine u intervalu od maksimalno 7 dana.");
                return;
            }

            setEndDate(newDate);
            setErrorMsg(""); // Brišemo grešku ako je sve ok
        }
    };

    const fetchPorudzbine = async () => {
        if (!startDate || !endDate) {
            alert("Molimo unesite oba datuma!");
            return;
        }

        const formatDate = (date) => new Date(date).toISOString().split("T")[0];
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        try {
            const response = await fetch(`http://127.0.0.1:8080/api/v1/porudzbina/get/user/${decodedToken.id}/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                setPorudzbine([]);
                setPorudzDostupne(false);
            } else if (!response.ok) {
                throw new Error("Greška pri učitavanju porudžbina.");
            } else {
                const result = await response.json();
                // 2. Sortiramo niz po datumu (pretpostavljam da je "datum" string koji se može parsirati)
                result.sort((a, b) => new Date(a.datum) - new Date(b.datum));
                const activeOrders = result.filter(porudzb => porudzb.status === true);
                setPorudzbine(activeOrders);
                setPorudzDostupne(result.length > 0);
            }
        } catch (error) {
            console.error("Greška pri učitavanju porudžbina:", error);
            setPorudzDostupne(false);
        }
    };

    return (
        <div>
            <NavBar />
            <div className="container ">
                <p className="text-center fw-bold mt-5" style={{ fontFamily: "Montserrat", fontSize: 16, color: "#486F5B" }}>Pregled porudzbina: </p>
                {/* Ovaj div centriramo u kolonu */}
                <div className="d-flex flex-column align-items-center gap-3 w-100">
                    <div className="d-flex justify-content-center gap-3 w-50">
                        <input
                            type="date"
                            className="form-control"
                            value={startDate}
                            onChange={(e) => handleDateChange(e, "start")}
                        />
                        <input
                            type="date"
                            className="form-control"
                            min={startDate}
                            max={startDate ? new Date(new Date(startDate).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0] : ""}
                            value={endDate}
                            onChange={(e) => handleDateChange(e, "end")}
                            disabled={!startDate}
                        />
                    </div>

                    {/* Dugme je sada ispod inputa i centrirano */}
                    <button className="btn fw-bold mt-2"
                        style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 14 }}
                        onClick={fetchPorudzbine}>
                        Pretraži
                    </button>
                </div>

                {errorMsg && <p className="text-danger fw-bold text-center mt-3">{errorMsg}</p>}

                {!porudzDostupne ? (
                    <p className=" text-danger fw-bold text-center" style={{ fontSize: "30px", fontFamily: "Montserrat", marginTop: 100 }}>
                        Niste imali porudzbine u odabranom periodu.
                    </p>
                ) : (
                    <div className="row mt-5">
                        {porudzbine.map((p, index) => (
                            <div key={index} className="col-md-4 d-flex justify-content-center">
                                <Porudzbina porudzbina={p} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PregledPage;