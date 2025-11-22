import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import NavBar from "../components/NavBar";
import Table from "../components/Table";

const AdminKompanije = () => {

    const columns = ["Naziv", "Adresa", "PIB", "MBR", "Status"];
    const [data, setData] = useState([]);
    const [selectedComp, setSelectedComp] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [compForm, setCompForm] = useState({
        naziv: "",
        adresa: "",
        pib: "",
        mbr: "",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);


    const fetchComp = async () => {
        try {
            if (!token) {
                console.error("Nema tokena, preusmeravanje na login...");
                return;
            }
            const response = await fetch("https://naruci.co.rs/api/v1/kompanija/get/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju podataka");

            const result = await response.json();
            const formattedData = result.map(comp => ({
                id: comp.id,
                naziv: comp.naziv,
                adresa: comp.adresa,
                pib: comp.pib,
                mbr: comp.mbr,
                status: comp.status ? "aktivan" : "neaktivan"
            }));
            setData(formattedData);
        } catch (error) {
            console.error("Greška pri dohvaćanju podataka:", error);
        }
    };

    useEffect(() => {
        fetchComp();
    }, []);

    const handleRowClick = (comp) => {
        setSelectedComp(selectedComp?.id === comp.id ? null : comp);
    };

    const toggleCompStatus = async () => {
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }

        const newStatus = selectedComp.status === "aktivan" ? false : true;

        try {
            await fetch(`https://naruci.co.rs/api/v1/kompanija/update/${selectedComp.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    naziv: selectedComp.naziv,
                    adresa: selectedComp.adresa,
                    pib: selectedComp.pib,
                    mbr: selectedComp.mbr,
                    status: newStatus,
                    userId: decodedToken.id
                })
            });

            alert("Status kompanije ažuriran!");
            fetchComp();
        } catch (error) {
            console.error("Greška pri ažuriranju statusa:", error);
        }
    };

    // ✅ Dodavanje/Izmena role
    const openModal = (edit = false) => {
        setEditMode(edit);
        if (edit && selectedComp) {
            setCompForm({
                naziv: selectedComp.naziv,
                adresa: selectedComp.adresa,
                pib: selectedComp.pib,
                mbr: selectedComp.mbr
            });
        } else {
            setCompForm({
                naziv: "",
                adresa: "",
                pib: "",
                mbr: ""
            });
        }
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const handleSave = async () => {
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }
        if (!compForm.naziv || !compForm.adresa || !compForm.pib || !compForm.mbr)
            return alert("Sva polja su obavezna!");

        const method = editMode ? "PUT" : "POST";
        const url = editMode
            ? `https://naruci.co.rs/api/v1/kompanija/update/${selectedComp.id}`
            : "https://naruci.co.rs/api/v1/kompanija/create";

        const requestBody = {
            ...compForm,
            userId: decodedToken.id,
            ...(editMode && { status: selectedComp.status }) // Samo ako je editMode, dodaj status: true
        };

        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(requestBody)
            });
            alert(editMode ? "Kompanija ažurirana!" : "Nova kompanija dodata!");
            setModalOpen(false);
            fetchComp();
        } catch (error) {
            console.error("Greška pri čuvanju kompanije:", error);
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
                        <input type="text" className="form-control" style={{ fontSize: 14 }} placeholder="Pretraga po nazivu"
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => openModal(false)}>
                        Dodaj novu kompaniju</button>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => selectedComp && openModal(true)} disabled={!selectedComp}>
                        Izmeni selektovanu kompaniju</button>
                    <button className="btn fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={toggleCompStatus} disabled={!selectedComp}>
                        Aktiviraj / Deaktiviraj kompaniju</button>
                </div>

                {/* Glavni sadržaj */}
                <div className="container flex-grow-1 d-flex flex-column " style={{ height: "90%" }}>
                    <h2 className="fw-bold mb-4 mt-3" style={{ fontFamily: "Montserrat", fontSize: 27, color: "#424242" }}>Lista kompanija</h2>
                    <div style={{ height: "calc(100% - 10px)" }}>
                        <Table columns={columns} data={data.filter(comp => searchTerm.length < 2 || comp.naziv.toLowerCase().includes(searchTerm.toLowerCase()))}
                            rowsPerPage={rowsPerPage} onRowClick={handleRowClick} selected={selectedComp} />
                    </div>
                </div>

                {modalOpen && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-content align-items-center" onClick={(e) => e.stopPropagation()}>
                            <h2 className="fw-bold  mb-5" style={{ fontFamily: "Montserrat", fontSize: 32, color: "white" }}>{editMode ? "Izmeni kompaniju" : "Dodaj kompaniju"}</h2>
                            <input type="text" name="naziv" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={compForm.naziv} onChange={handleChange} placeholder="Naziv" />
                            <input type="text" name="adresa" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={compForm.adresa} onChange={handleChange} placeholder="Adresa" />
                            <input type="text" name="pib" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={compForm.pib} onChange={handleChange} placeholder="PIB" />
                            <input type="text" name="mbr" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={compForm.mbr} onChange={handleChange} placeholder="MBR" />
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

export default AdminKompanije;