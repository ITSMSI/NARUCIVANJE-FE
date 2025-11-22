import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import NavBar from "../components/NavBar";
import Table from "../components/Table";

const AdminObroci = () => {
    const columns = ["Naziv", "Slika", "Opis", "Status"];
    const [data, setData] = useState([]);
    const [selectedObrok, setSelectedObrok] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [obrokForm, setObrokForm] = useState({
        naziv: "",
        opis: "",
        slika: null, // Slika će biti fajl
    });
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);

    const fetchObroci = async () => {
        try {
            if (!token) {
                console.error("Nema tokena, preusmeravanje na login...");
                return;
            }
            const response = await fetch("https://naruci.co.rs/api/v1/obrok/get/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju podataka");

            const result = await response.json();
            const formattedData = result.map(obrok => ({
                id: obrok.id,
                naziv: obrok.naziv,
                slika: <img src={`https://naruci.co.rs/api/v1/obrok/image/${obrok.id}?t=${new Date().getTime()}`}
                    alt="Slika obroka" style={{ width: 45, height: 45, objectFit: "cover", borderRadius: "5px" }} />,
                opis: obrok.opis,
                status: obrok.status ? "aktivan" : "neaktivan",
            }));
            setData(formattedData);
        } catch (error) {
            console.error("Greška pri dohvaćanju podataka:", error);
        }
    };

    useEffect(() => {
        fetchObroci();
    }, []);

    const handleRowClick = (obrok) => {
        setSelectedObrok(selectedObrok?.id === obrok.id ? null : obrok);
    };

    const toggleObrokStatus = async () => {
        if (!token || !selectedObrok) {
            console.error("Nema tokena ili obrok nije selektovan.");
            return;
        }

        const newStatus = selectedObrok.status === "aktivan" ? false : true;

        try {
            await fetch(`https://naruci.co.rs/api/v1/obrok/update/${selectedObrok.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    naziv: selectedObrok.naziv,
                    opis: selectedObrok.opis,
                    status: newStatus,
                    userId: decodedToken.id
                })
            });

            alert("Status obroka ažuriran!");
            fetchObroci();
        } catch (error) {
            console.error("Greška pri ažuriranju statusa:", error);
        }
    };

    // ✅ Dodavanje/Izmena
    const openModal = (edit = false) => {
        setEditMode(edit);
        if (edit && selectedObrok) {
            setObrokForm({
                naziv: selectedObrok.naziv,
                opis: selectedObrok.opis,
                slika: null // Ne učitavamo staru sliku jer je na serveru
            });
        } else {
            setObrokForm({
                naziv: "",
                opis: "",
                slika: null
            });
        }
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setObrokForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setObrokForm(prevState => ({
                ...prevState,
                slika: e.target.files[0] // Slika se čuva kao fajl objekat
            }));
        }
    };

    const handleSave = async () => {
        if (!obrokForm.naziv || !obrokForm.opis) {
            alert("Sva polja su obavezna!");
            return;
        }

        const method = editMode ? "PUT" : "POST";
        const url = editMode
            ? `https://naruci.co.rs/api/v1/obrok/update/${selectedObrok.id}`
            : "https://naruci.co.rs/api/v1/obrok/create";

        try {
            // **Prvi korak**: Kreiramo obrok BEZ slike (ako postoji)
            const obrokResponse = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    naziv: obrokForm.naziv,
                    opis: obrokForm.opis,
                    status: editMode ? (selectedObrok.status === "aktivan" ? true : false) : true,
                    userId: decodedToken.id
                })
            });

            if (!obrokResponse.ok) throw new Error("Greška pri kreiranju/izmeni obroka");

            const obrokData = await obrokResponse.json(); // Backend vraća kreirani obrok

            // **Drugi korak**: Ako postoji nova slika, šaljemo je odvojeno
            if (obrokForm.slika) {
                const formData = new FormData();
                formData.append("file", obrokForm.slika);

                const slikaResp=await fetch(`https://naruci.co.rs/api/v1/obrok/upload-image/${obrokData.id}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                if (slikaResp.status === 403) {
                    alert("Slika je previse velika, redukujte velicinu na 1000x1000 i probajte ponovo!");
                    return;
                }
            }
            alert(editMode ? "Obrok ažuriran!" : "Novi obrok dodat!");
            setModalOpen(false);
            fetchObroci();
        } catch (error) {
            console.error("Greška pri čuvanju obroka:", error);
        }
    };

    const [rowsPerPage, setRowsPerPage] = useState(7);

    // Prilagođavanje broja redova na osnovu veličine ekrana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 950 || window.innerHeight < 800) {
                setRowsPerPage(4); // Na manjim ekranima prikazujemo manje redova
            } else {
                setRowsPerPage(6); // Na većim ekranima prikazujemo više redova
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
                    <button className="btn mb-4 fw-bold w-100 mt-4"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => openModal(false)}>
                        Dodaj novi obrok</button>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => selectedObrok && openModal(true)} disabled={!selectedObrok}>
                        Izmeni selektovan obrok</button>
                    <button className="btn fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={toggleObrokStatus} disabled={!selectedObrok} >
                        Aktiviraj / Deaktiviraj obrok</button>
                </div>

                {/* Glavni sadržaj */}
                <div className="container flex-grow-1 d-flex flex-column " style={{ height: "90%" }}>
                    <h2 className="fw-bold mb-4 mt-3" style={{ fontFamily: "Montserrat", fontSize: 27, color: "#424242" }}>Lista obroka</h2>
                    <div style={{ height: "calc(100% - 10px)" }}>
                        <Table columns={columns}
                            data={data} rowsPerPage={rowsPerPage} onRowClick={handleRowClick} selected={selectedObrok} />
                    </div>
                </div>

                {modalOpen && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-content align-items-center" onClick={(e) => e.stopPropagation()}>
                            <h2 className="fw-bold  mb-5" style={{ fontFamily: "Montserrat", fontSize: 32, color: "white" }}>{editMode ? "Izmeni obrok" : "Dodaj obrok"}</h2>
                            <input type="text" name="naziv" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={obrokForm.naziv} onChange={handleChange} placeholder="Naziv" />
                            <textarea name="opis" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={obrokForm.opis} onChange={handleChange} placeholder="Opis"></textarea>
                            <input className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                type="file" onChange={handleFileChange} />
                            <button className="btn mb-3 w-75 fw-bold "
                                style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 16, color: "#486F5B" }}
                                onClick={handleSave}>Sačuvaj</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminObroci;