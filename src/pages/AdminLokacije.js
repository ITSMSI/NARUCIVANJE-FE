import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import NavBar from "../components/NavBar";
import Table from "../components/Table";

const AdminLokacije = () => {

    const columns = ["Kompanija", "Adresa", "Grad", "Postkod", "Status"];
    const [data, setData] = useState([]);
    const [selectedLok, setSelectedLok] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [lokForm, setLokForm] = useState({
        adresa: "",
        postkod: "",
        grad: "",
        kompanijaId: ""
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [company, setCompanies] = useState([]);
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);


    const fetchLok = async () => {
        try {
            if (!token) {
                console.error("Nema tokena, preusmeravanje na login...");
                return;
            }
            const response = await fetch("https://narucivanje-back.naruci.co.rs:8443/api/v1/lokacija/get/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju podataka");

            const result = await response.json();
            const formattedData = result.map(lok => ({
                id: lok.id,
                kompanija: lok.kompanija.naziv,
                adresa: lok.adresa,
                grad: lok.grad,
                postkod: lok.postkod,
                status: lok.status ? "aktivan" : "neaktivan"
            }));
            setData(formattedData);
        } catch (error) {
            console.error("Greška pri dohvaćanju podataka:", error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const compResponse = await fetch("https://narucivanje-back.naruci.co.rs:8443/api/v1/kompanija/get/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!compResponse.ok) throw new Error("Greška pri učitavanju lokacija/rola");

            setCompanies(await compResponse.json());
        } catch (error) {
            console.error("Greška pri učitavanju lokacija i rola:", error);
        }
    };

    useEffect(() => {
        fetchLok();
        fetchCompanies();
    }, []);

    const handleRowClick = (lok) => {
        setSelectedLok(selectedLok?.id === lok.id ? null : lok);
    };

    const toggleLokStatus = async () => {
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }

        const newStatus = selectedLok.status === "aktivan" ? false : true;

        try {
            await fetch(`https://narucivanje-back.naruci.co.rs:8443/api/v1/lokacija/update/${selectedLok.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: selectedLok.id,
                    adresa: selectedLok.adresa,
                    postkod: selectedLok.postkod,
                    grad: selectedLok.grad,
                    kompanija: selectedLok.kompanija.naziv,
                    status: newStatus,
                    userId: decodedToken.id
                })
            });

            alert("Status lokacije ažuriran!");
            fetchLok();
        } catch (error) {
            console.error("Greška pri ažuriranju statusa:", error);
        }
    };

    // ✅ Dodavanje/Izmena
    const openModal = (edit = false) => {
        setEditMode(edit);
        if (edit && selectedLok) {
            setLokForm({
                adresa: selectedLok.adresa,
                postkod: selectedLok.postkod,
                grad: selectedLok.grad,
                kompanijaId: company.find(comp => comp.naziv === selectedLok.kompanija)?.id || ""
            });
        } else {
            setLokForm({
                adresa: "",
                postkod: 0,
                grad: "",
                kompanijaId: ""
            });
        }
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLokForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const handleSave = async () => {
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }
        if (!lokForm.adresa || !lokForm.grad || !lokForm.postkod)
            return alert("Sva polja su obavezna!");

        const method = editMode ? "PUT" : "POST";
        const url = editMode
            ? `https://narucivanje-back.naruci.co.rs:8443/api/v1/lokacija/update/${selectedLok.id}`
            : "https://narucivanje-back.naruci.co.rs:8443/api/v1/lokacija/create";

        const requestBody = {
            adresa: lokForm.adresa,
            postkod: lokForm.postkod,
            grad: lokForm.grad,
            kompanijaId: lokForm.kompanijaId,
            userId: decodedToken.id,
            ...(editMode && { status: selectedLok.status }) // Samo ako je editMode, dodaj status: true
        };
        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(requestBody)
            });
            alert(editMode ? "Lokacija ažurirana!" : "Nova lokacija dodata!");
            setModalOpen(false);
            fetchLok();
        } catch (error) {
            console.error("Greška pri čuvanju lokacija:", error);
        }
    };

    const [rowsPerPage, setRowsPerPage] = useState(7);

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
                    <div className="input-group mb-4 w-100 mt-4"
                        style={{ fontFamily: "Montserrat" }}>
                        <input type="text" className="form-control" style={{ fontSize: 14 }} placeholder="Pretraga po kompaniji"
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => openModal(false)}>
                        Dodaj novu lokaciju</button>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => selectedLok && openModal(true)} disabled={!selectedLok}>
                        Izmeni selektovanu lokaciju</button>
                    <button className="btn fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={toggleLokStatus} disabled={!selectedLok}>
                        Aktiviraj / Deaktiviraj lokaciju</button>
                </div>

                {/* Glavni sadržaj */}
                <div className="container flex-grow-1 d-flex flex-column " style={{ height: "90%" }}>
                    <h2 className="fw-bold mb-4 mt-3" style={{ fontFamily: "Montserrat", fontSize: 27, color: "#424242" }}>Lista lokacija</h2>
                    <div style={{ height: "calc(100% - 10px)" }}>
                        <Table columns={columns} data={data.filter(lok => searchTerm.length < 2 || lok.kompanija.toLowerCase().includes(searchTerm.toLowerCase()))}
                            rowsPerPage={rowsPerPage} onRowClick={handleRowClick} selected={selectedLok} />
                    </div>
                </div>

                {modalOpen && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-content align-items-center" onClick={(e) => e.stopPropagation()}>
                            <h2 className="fw-bold  mb-5" style={{ fontFamily: "Montserrat", fontSize: 32, color: "white" }}>{editMode ? "Izmeni lokaciju" : "Dodaj lokaciju"}</h2>
                            <input type="text" name="adresa" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={lokForm.adresa} onChange={handleChange} placeholder="Adresa" />
                            <input type="text" name="postkod" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={lokForm.postkod} onChange={handleChange} placeholder="Postkod" />
                            <input type="text" name="grad" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={lokForm.grad} onChange={handleChange} placeholder="Grad" />
                            <select className="w-75 mb-3" value={lokForm.kompanijaId} onChange={(e) => setLokForm({ ...lokForm, kompanijaId: e.target.value })}>
                                {company.map(comp => <option key={comp.id} value={comp.id}>{comp.naziv}</option>)}
                            </select>
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

export default AdminLokacije;