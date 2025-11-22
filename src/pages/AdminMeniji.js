import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import NavBar from "../components/NavBar";
import Table from "../components/Table";

const AdminMeniji = () => {
    const columns = ["Datum", "Obroci", "Status"];
    const [data, setData] = useState([]);
    const [rawMeniji, setRawMeniji] = useState([]); // originalni podaci sa backa
    const [rowsPerPage, setRowsPerPage] = useState();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);

    const [selectedMeni, setSelectedMeni] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [availableObroci, setAvailableObroci] = useState([]); // Svi dostupni obroci
    const [meniForm, setMeniForm] = useState({
        datum: "",
        obroci: new Set(), // Koristimo set za jedinstvene obroke
    });


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

    const fetchMeni = async () => {
        if (!startDate || !endDate) {
            setErrorMsg("Morate uneti oba datuma!");
            return;
        }

        setErrorMsg(""); // Resetujemo grešku ako je sve ok
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }
        const formatDate = (date) => new Date(date).toISOString().split("T")[0];
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        try {

            const response = await fetch(`http://127.0.0.1:8080/api/v1/meni/get/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Greška pri učitavanju menija");

            const result = await response.json();
            setRawMeniji(result); // čuvamo originalne podatke
            result.sort((a, b) => new Date(a.datum) - new Date(b.datum));
            const formattedData = result.map(meni => ({
                id: meni.id,
                datum: meni.datum,
                obrociIds: meni.obroci.map(obrok => obrok.naziv).join(", "),
                status: meni.status ? "aktivan" : "neaktivan",
            }));

            setData(formattedData);
        } catch (error) {
            console.error("Greška pri dohvaćanju menija:", error);
        }
    };

    useEffect(() => {
        if (modalOpen) fetchObroci();
    }, [modalOpen]);

    const fetchObroci = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8080/api/v1/obrok/get/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Greška pri učitavanju obroka");
            const result=await response.json();
            const activeObrok = result.filter(obrok => obrok.status === true);
            setAvailableObroci(activeObrok);
        } catch (error) {
            console.error("Greška pri učitavanju obroka:", error);
        }
    };

    const addObrokToMeni = (obrok) => {
        setMeniForm(prevState => ({
            ...prevState,
            obroci: new Set(prevState.obroci).add(obrok)
        }));
    };
    const removeObrokFromMeni = (obrok) => {
        setMeniForm(prevState => {
            const newObroci = new Set(prevState.obroci);
            newObroci.delete(obrok);
            return { ...prevState, obroci: newObroci };
        });
    };

    const openModal = (edit = false) => {
        setEditMode(edit);
        if (edit && selectedMeni) {
            /*setMeniForm({
                datum: selectedMeni.datum, // Popunjavamo datum iz selektovanog menija
                obroci: new Set(selectedMeni.obroci.split(", ").map(naziv => ({ naziv })))
            });*/
            // Pronađi pravi objekat menija u rawMeniji
            const rawMeni = rawMeniji.find(m => m.id === selectedMeni.id);
            // Sada rawMeni.obroci je niz objekata { id, naziv, opis, ... }
            setMeniForm({
                datum: rawMeni.datum,
                obroci: new Set(rawMeni.obroci) // ubacujemo celu listu obroka sa ID‐jevima
            });
        } else {
            setMeniForm({
                datum: "",
                obroci: new Set()
            });
        }
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!meniForm.datum || meniForm.obroci.size === 0) {
            alert("Morate uneti datum i dodati bar jedan obrok!");
            return;
        }


        try {
            let meniId = selectedMeni?.id;
            let method = editMode ? "PUT" : "POST";
            let url = editMode
                ? `http://127.0.0.1:8080/api/v1/meni/update/${meniId}`
                : "http://127.0.0.1:8080/api/v1/meni/create";

            // **Prvi korak**: Kreiramo ili ažuriramo meni BEZ obroka
            const meniResponse = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    datum: meniForm.datum,
                    status: editMode ? (selectedMeni.status === "aktivan") : true,
                    userId: decodedToken.id
                })
            });

            if (meniResponse.status === 500) {
                alert("Meni za taj datum već postoji. Molimo izaberite opciju za izmenu.");
                return;
            }

            if (!meniResponse.ok) throw new Error("Greška pri kreiranju/izmeni menija");

            // Ako je POST kreiranje, dobijamo kreirani meni i njegov ID
            if (!editMode) {
                const meniData = await meniResponse.json();
                meniId = meniData.id; // ID novog menija
            }

            // **Drugi korak**: Dodajemo obroke u meni
            const obrociIds = [...meniForm.obroci].map(obrok => obrok.id);
            const obrokUrl = `http://127.0.0.1:8080/api/v1/meni/${meniId}/add-obroks`;

            await fetch(obrokUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    obrokIds: obrociIds,
                    userId: decodedToken.id
                })
            });


            alert(editMode ? "Meni ažuriran!" : "Novi meni dodat!");
            setModalOpen(false);
            fetchMeni();
        } catch (error) {
            console.error("Greška pri čuvanju menija:", error);
        }
    };

    const handleRemoveObrok = async (obrok) => {
        if (!selectedMeni) return;
        try {
            const response = await fetch(`http://127.0.0.1:8080/api/v1/meni/${selectedMeni.id}/remove-obrok/${obrok.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Greška pri uklanjanju obroka iz menija");
            // Ažuriraj lokalno stanje tako što ćeš ukloniti obrok iz set-a
            removeObrokFromMeni(obrok);
        } catch (error) {
            console.error("Error removing obrok from meni:", error);
        }
    };

    const toggleMeniStatus = async () => {
        if (!token || !selectedMeni) {
            console.error("Nema tokena ili meni nije selektovan.");
            return;
        }

        const newStatus = selectedMeni.status === "aktivan" ? false : true;

        try {
            await fetch(`http://127.0.0.1:8080/api/v1/meni/update/${selectedMeni.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    datum: selectedMeni.datum,
                    status: newStatus,
                    userId: decodedToken.id
                })
            });

            alert("Status menija ažuriran!");
            fetchMeni();
        } catch (error) {
            console.error("Greška pri ažuriranju statusa:", error);
        }
    };

    const handleRowClick = (meni) => {
        setSelectedMeni(selectedMeni?.id === meni.id ? null : meni);
    };

    // Prilagođavanje broja redova na osnovu veličine ekrana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 950 || window.innerHeight < 800) {
                setRowsPerPage(5); // Na manjim ekranima prikazujemo manje redova
            } else {
                setRowsPerPage(8); // Na većim ekranima prikazujemo više redova
            }
        };


        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    return (
        <div className="d-flex flex-column" style={{ minHeight: "100vh" }} >
            <NavBar />
            <div className="d-flex flex-grow-1 align-items-stretch p-4" style={{ height: "calc(100vh - 70px)" }}>

                {/* Sidebar */}
                <div className="p-3 m-4 shadow-lg text-center d-flex flex-column justify-content-start align-items-center"
                    style={{
                        borderRadius: "20px", backgroundColor: "#486F5B", width: "320px",
                        height: "90%"
                    }}>

                    <input
                        type="date"
                        className="form-control w-100 mx-auto mb-4 mt-4"
                        value={startDate}
                        onChange={(e) => handleDateChange(e, "start")}
                    />
                    <input
                        type="date"
                        className="form-control w-100 mx-auto mb-4 "
                        min={startDate}
                        max={startDate ? new Date(new Date(startDate).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0] : ""}
                        value={endDate}
                        onChange={(e) => handleDateChange(e, "end")}
                        disabled={!startDate}
                    />

                    {/* Prikaz greške ako su datumi prazni */}
                    {errorMsg && <p className="text-danger fw-bold">{errorMsg}</p>}

                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={fetchMeni}>
                        Pretraži</button>

                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => openModal(false)}>
                        Dodaj novi meni</button>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => selectedMeni && openModal(true)} disabled={!selectedMeni}>
                        Izmeni selektovani meni</button>
                    <button className="btn fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={toggleMeniStatus} disabled={!selectedMeni}>
                        Aktiviraj / Deaktiviraj meni</button>
                </div>

                {/* Glavni sadržaj */}
                <div className="container flex-grow-1 d-flex flex-column " style={{ height: "90%" }}>
                    <h2 className="fw-bold mb-4 mt-3" style={{ fontFamily: "Montserrat", fontSize: 27, color: "#424242" }}>Lista menija</h2>
                    <div style={{ height: "calc(100% - 10px)" }}>
                        <Table columns={columns} data={data} rowsPerPage={rowsPerPage} onRowClick={handleRowClick} selected={selectedMeni} />
                    </div>
                </div>

                {modalOpen && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-content align-items-center" onClick={(e) => e.stopPropagation()}>
                            <h2 className="fw-bold mb-5" style={{ fontFamily: "Montserrat", fontSize: 32, color: "white" }}>
                                {editMode ? "Izmeni meni" : "Dodaj meni"}
                            </h2>
                            <input type="date" name="datum" className="w-75 mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                disabled={editMode} value={meniForm.datum} onChange={(e) => setMeniForm({ ...meniForm, datum: e.target.value })} />


                            <h4 className="fw-bold mt-3" style={{ fontSize: 18, color: "white" }}>Dodaj obrok u meni</h4>
                            <div className="d-flex w-100 justify-content-between mb-5">

                                {/* Lista dostupnih obroka */}
                                <div className="w-50 me-2" style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid white", padding: "10px", borderRadius: "10px" }}>
                                    {availableObroci.map(obrok => (
                                        <button key={obrok.id} className="btn btn-outline-light btn-sm w-100 mb-1"
                                            onClick={() => addObrokToMeni(obrok)}>
                                            {obrok.naziv}
                                        </button>
                                    ))}
                                </div>

                                {/* Lista izabranih obroka */}
                                <div className="w-50 ms-2" style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid white", padding: "10px", borderRadius: "10px" }}>
                                    {[...meniForm.obroci].map(obrok => (
                                        <div key={obrok.id} className="d-flex justify-content-between align-items-center mb-1">
                                            <span>{obrok.naziv}</span>
                                            <button className="btn btn-sm" onClick={() => handleRemoveObrok(obrok)}>✖</button>
                                        </div>
                                    ))}
                                </div>

                            </div>

                            <button className="btn mb-3 w-75 fw-bold"
                                style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 16, color: "#486F5B" }}
                                onClick={handleSave}>Sačuvaj</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminMeniji;