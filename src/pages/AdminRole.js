import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import NavBar from "../components/NavBar";
import Table from "../components/Table";

const AdminRole = () => {

    const columns = ["Naziv", "Admin", "Korisnik", "Obrok", "Meni", "Kompanija", "Pregled", "Status"];
    const [data, setData] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null); // ✅ Selektovana rola
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [roleForm, setRoleForm] = useState({
        naziv: "",
        admin: false,
        endUser: false,
        obrok: false,
        meni: false,
        kompanija: false,
        pregled: false
    });
    const [rowsPerPage, setRowsPerPage] = useState();
    const token = localStorage.getItem("token"); // 🔹 Uzimamo token iz storage-a
    const decodedToken = jwtDecode(token);

    // 🚀 1. Fetch podataka iz baze (API poziv)
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {

            if (!token) {
                console.error("Nema tokena, preusmeravanje na login...");
                return;
            }
            const response = await fetch("https://narucivanje-back.naruci.co.rs:8443/api/v1/role/get/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju podataka");

            const result = await response.json();

            const formattedData = result.map(role => ({
                id: role.id, // ✅ Dodajemo ID zbog selekcije
                naziv: role.naziv,
                admin: role.admin ? "✔" : "✖",
                korisnik: role.korisnik ? "✔" : "✖",
                obrok: role.obrok ? "✔" : "✖",
                meni: role.meni ? "✔" : "✖",
                kompanija: role.kompanija ? "✔" : "✖",
                pregled: role.pregled ? "✔" : "✖",
                status: role.status ? "aktivan" : "neaktivan",
            }));
            setData(formattedData); // 🔹 Postavljanje podataka u useState
        } catch (error) {
            console.error("Greška pri dohvaćanju podataka:", error);
        }
    };

    // ✅ Klikom na red u tabeli selektujemo rolu
    const handleRowClick = (role) => {
        if (selectedRole?.id === role.id) {
            setSelectedRole(null); // ✅ Ako je već selektovan, poništi selekciju
        } else {
            setSelectedRole(role); // ✅ Ako nije selektovan, postavi ga
        }
    };


    // ✅ Aktivacija/Deaktivacija role
    const toggleRoleStatus = async () => {
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }

        const newStatus = selectedRole.status === "aktivan" ? false : true;

        try {
            await fetch(`https://narucivanje-back.naruci.co.rs:8443/api/v1/role/update/${selectedRole.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    naziv: selectedRole.naziv,
                    admin: selectedRole.admin === "✔", // 🔹 Konverzija ✔ -> true, ✖ -> false
                    endUser: selectedRole.korisnik === "✔", // 🔹 Proveri da li backend koristi "endUser" umesto "korisnik"
                    obrok: selectedRole.obrok === "✔",
                    meni: selectedRole.meni === "✔",
                    kompanija: selectedRole.kompanija === "✔",
                    pregled: selectedRole.pregled === "✔",
                    status: newStatus, // ✅ Ažuriranje samo statusa
                    userId: decodedToken.id // ✅ Logovani korisnik koji menja status 
                })
            });

            alert("Status role ažuriran!");
            fetchRoles(); // Ponovo učitavamo podatke
        } catch (error) {
            console.error("Greška pri ažuriranju statusa:", error);
        }
    };


    // ✅ Dodavanje/Izmena role
    const openModal = (edit = false) => {
        setEditMode(edit);
        if (edit && selectedRole) {
            setRoleForm({
                naziv: selectedRole.naziv,
                admin: selectedRole.admin === "✔",
                endUser: selectedRole.korisnik === "✔",
                obrok: selectedRole.obrok === "✔",
                meni: selectedRole.meni === "✔",
                kompanija: selectedRole.kompanija === "✔",
                pregled: selectedRole.pregled === "✔"
            });
        } else {
            setRoleForm({
                naziv: "",
                admin: false,
                endUser: false,
                obrok: false,
                meni: false,
                kompanija: false,
                pregled: false
            });
        }
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setRoleForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSave = async () => {
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }
        if (!roleForm.naziv) {
            alert("Naziv role je obavezan!");
            return;
        }

        const method = editMode ? "PUT" : "POST";
        const url = editMode
            ? `https://narucivanje-back.naruci.co.rs:8443/api/v1/role/update/${selectedRole.id}`
            : "https://narucivanje-back.naruci.co.rs:8443/api/v1/role/create";

        // 🛠 Pravimo objekat sa podacima
        let requestBody = {
            ...roleForm,
            userId: decodedToken.id, // Uvek se šalje
        };

        // 🛠 Ako je `PUT` (update), dodaj i status
        if (editMode) {
            requestBody.status = selectedRole.status === "aktivan"; // Konvertuje u `true/false`
        }

        try {
            await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            alert(editMode ? "Rola je ažurirana!" : "Nova rola je dodata!");
            setModalOpen(false);
            fetchRoles();
        } catch (error) {
            console.error("Greška pri čuvanju role:", error);
        }
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
                    <button className="btn mb-4 fw-bold w-100 mt-4"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => openModal(false)}>
                        Dodaj novu rolu</button>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => selectedRole && openModal(true)} disabled={!selectedRole}>
                        Izmeni selektovanu rolu</button>
                    <button className="btn fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={toggleRoleStatus} disabled={!selectedRole}>
                        Aktiviraj / Deaktiviraj rolu</button>
                </div>

                {/* Glavni sadržaj */}
                <div className="container flex-grow-1 d-flex flex-column " style={{ height: "90%" }}>
                    <h2 className="fw-bold mb-4 mt-3" style={{ fontFamily: "Montserrat", fontSize: 27, color: "#424242" }}>Lista rola</h2>
                    <div style={{ height: "calc(100% - 10px)" }}>
                        <Table columns={columns} data={data} rowsPerPage={rowsPerPage} onRowClick={handleRowClick} selected={selectedRole} />
                    </div>
                </div>
            </div>
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content align-items-center " onClick={(e) => e.stopPropagation()}>
                        <h2 className="fw-bold  mb-5" style={{ fontFamily: "Montserrat", fontSize: 32, color: "white" }}>{editMode ? "Izmeni rolu" : "Dodaj novu rolu"}</h2>
                        <input className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }} type="text" name="naziv" value={roleForm.naziv} onChange={handleChange} placeholder="Naziv role" />
                        <label><input className="mb-3" type="checkbox" name="admin" checked={roleForm.admin}
                            onChange={handleChange} /> Admin</label>
                        <label><input className="mb-3" type="checkbox" name="korisnik" checked={roleForm.korisnik}
                            onChange={handleChange} /> Korisnik</label>
                        <label><input className="mb-3" type="checkbox" name="obrok" checked={roleForm.obrok}
                            onChange={handleChange} /> Obrok</label>
                        <label><input className="mb-3" type="checkbox" name="meni" checked={roleForm.meni}
                            onChange={handleChange} /> Meni</label>
                        <label><input className="mb-3" type="checkbox" name="kompanija" checked={roleForm.kompanija}
                            onChange={handleChange} /> Kompanija</label>
                        <label><input className="mb-5" type="checkbox" name="pregled" checked={roleForm.pregled}
                            onChange={handleChange} /> Pregled</label>
                        <button className="btn mb-3 w-75 fw-bold "
                            style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 16, color: "#486F5B" }}
                            onClick={handleSave}>Sačuvaj</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminRole;