import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import NavBar from "../components/NavBar";
import Table from "../components/Table";


const AdminKorisnici = () => {
    const columns = ["Ime", "Prezime", "Email", "Telefon", "Kompanija", "Lokacija", "Rola", "Status"];
    const [data, setData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [userForm, setUserForm] = useState({
        ime: "",
        prezime: "",
        email: "",
        telefon: "",
        kompanijaId: "",
        lokacijaId: "",
        roleId: "",
        password: "" // Novo polje
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [companies, setCompanies] = useState([]);
    const [locations, setLocations] = useState([]);
    const [roles, setRoles] = useState([]);
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);

    const [rowsPerPage, setRowsPerPage] = useState(7);

    const fetchUsers = async () => {
        try {
            if (!token) {
                console.error("Nema tokena, preusmeravanje na login...");
                return;
            }
            const response = await fetch("https://www.naruci.co.rs/api/v1/user/get/all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju podataka");

            const result = await response.json();
            const formattedData = result.map(user => ({
                id: user.id,
                ime: user.ime,
                prezime: user.prezime,
                email: user.email,
                telefon: user.telefon,
                kompanija: user.kompanija.naziv,
                lokacija: user.lokacija.adresa,
                rola: user.role.naziv,
                status: user.status ? "aktivan" : "neaktivan"
            }));
            setData(formattedData);
        } catch (error) {
            console.error("Greška pri dohvaćanju podataka:", error);
        }
    };

    // Fetch kompanija, lokacija i rola
    const fetchCompanies = async () => {
        try {
            const response = await fetch("https://www.naruci.co.rs/api/v1/kompanija/get/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju kompanija");

            setCompanies(await response.json());
        } catch (error) {
            console.error("Greška pri učitavanju kompanija:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch("https://www.naruci.co.rs/api/v1/role/get/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju rola");

            setRoles(await response.json());
        } catch (error) {
            console.error("Greška pri učitavanju rola:", error);
        }
    };

    const fetchLocationsByCompany = async (kompanijaId) => {
        try {
            const response = await fetch(`https://www.naruci.co.rs/api/v1/lokacija/get/kompanija/${kompanijaId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju lokacija");

            setLocations(await response.json());
        } catch (error) {
            console.error("Greška pri učitavanju lokacija:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchCompanies();
        fetchRoles();
    }, []);

    const handleCompanyChange = (e) => {
        const companyId = e.target.value;
        setUserForm({ ...userForm, kompanijaId: companyId, lokacijaId: "" });
        if (companyId) fetchLocationsByCompany(companyId);
    };

    const handleRowClick = (user) => {
        setSelectedUser(selectedUser?.id === user.id ? null : user);
    };

    const toggleUserStatus = async () => {
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }

        const newStatus = selectedUser.status === "aktivan" ? false : true;

        try {
            await fetch(`https://www.naruci.co.rs/api/v1/user/update/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ime: selectedUser.ime,
                    prezime: selectedUser.prezime,
                    email: selectedUser.email,
                    telefon: selectedUser.telefon,
                    roleId: roles.find(role => role.naziv === selectedUser.rola)?.id || "",
                    kompanijaId: companies.find(comp => comp.naziv === selectedUser.kompanija)?.id || "",
                    lokacijaId: locations.find(loc => loc.adresa === selectedUser.lokacija)?.id || "",
                    status: newStatus,
                    userId: decodedToken.id
                })
            });

            alert("Status korisnika ažuriran!");
            fetchUsers();
        } catch (error) {
            console.error("Greška pri ažuriranju statusa:", error);
        }
    };

    // ✅ Dodavanje/Izmena role
    const openModal = (edit = false) => {
        setEditMode(edit);
        if (edit && selectedUser) {
            setUserForm({
                ime: selectedUser.ime,
                prezime: selectedUser.prezime,
                email: selectedUser.email,
                telefon: selectedUser.telefon,
                kompanijaId: companies.find(comp => comp.naziv === selectedUser.kompanija)?.id || "",
                lokacijaId: locations.find(loc => loc.adresa === selectedUser.lokacija)?.id || "",
                roleId: roles.find(role => role.naziv === selectedUser.rola)?.id || "",
                password: "" // Ne menjamo lozinku prilikom editovanja
            });
        } else {
            setUserForm({
                ime: "",
                prezime: "",
                email: "",
                telefon: "",
                kompanijaId: "",
                lokacijaId: "",
                roleId: "",
                password: ""
            });
        }
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserForm(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (name === "kompanijaId") {
            setUserForm(prevState => ({ ...prevState, lokacijaId: "" }));

        }
    };

    useEffect(() => {
        if (userForm.kompanijaId) {
            fetchLocationsByCompany(userForm.kompanijaId);
        }
    }, [userForm.kompanijaId]);


    const handleSave = async () => {
        if (!userForm.ime || !userForm.email || !userForm.telefon || !userForm.kompanijaId || !userForm.lokacijaId || !userForm.roleId)
            return alert("Sva polja su obavezna!");

        const method = editMode ? "PUT" : "POST";
        const url = editMode
            ? `https://www.naruci.co.rs/api/v1/user/update/${selectedUser.id}`
            : "https://www.naruci.co.rs/auth/register";

        const requestBody = {
            ...userForm,
            password: editMode ? undefined : userForm.password, // Šaljemo password samo kod kreiranja
            userId: decodedToken.id
        };

        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(requestBody)
            });
            alert(editMode ? "Korisnik ažuriran!" : "Novi korisnik dodat!");
            setModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Greška pri čuvanju korisnika:", error);
            alert("Proverite da li korisnik sa tim emailom već postoji.");
        }
    };

    // Prilagođavanje broja redova na osnovu veličine ekrana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 950 || window.innerHeight < 800) {
                setRowsPerPage(4); // Na manjim ekranima prikazujemo manje redova
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
                        <input type="text" className="form-control" style={{ fontSize: 14 }} placeholder="Pretraga po emailu"
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => openModal(false)}>
                        Dodaj novog korisnika</button>
                    <button className="btn mb-4 fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={() => selectedUser && openModal(true)} disabled={!selectedUser}>
                        Izmeni selektovanog korisnika</button>
                    <button className="btn fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={toggleUserStatus} disabled={!selectedUser}>
                        Aktiviraj / Deaktiviraj korisnika</button>
                </div>

                {/* Glavni sadržaj */}
                <div className="container flex-grow-1 d-flex flex-column " style={{ height: "90%" }}>
                    <h2 className="fw-bold mb-4 mt-3" style={{ fontFamily: "Montserrat", fontSize: 27, color: "#424242" }}>Lista korisnika</h2>
                    <div style={{ height: "calc(100% - 10px)" }}>
                        <Table columns={columns} data={data.filter(user => searchTerm.length < 3 || user.email.toLowerCase().includes(searchTerm.toLowerCase()))}
                            rowsPerPage={rowsPerPage} onRowClick={handleRowClick} selected={selectedUser} />
                    </div>
                </div>

                {modalOpen && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-content align-items-center" onClick={(e) => e.stopPropagation()}>
                            <h2 className="fw-bold  mb-5" style={{ fontFamily: "Montserrat", fontSize: 32, color: "white" }}>{editMode ? "Izmeni korisnika" : "Dodaj korisnika"}</h2>
                            <input type="text" name="ime" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={userForm.ime} onChange={handleChange} placeholder="Ime" />
                            <input type="text" name="prezime" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={userForm.prezime} onChange={handleChange} placeholder="Prezime" />
                            <input type="email" name="email" className="w-75  mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={userForm.email} onChange={handleChange} placeholder="Email" />
                            <input type="text" name="telefon" className="w-75 mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={userForm.telefon} onChange={handleChange} placeholder="Telefon" autoComplete="off" />

                            {/* Dropdown za kompaniju */}
                            <select className="w-75 mb-3" name="kompanijaId" value={userForm.kompanijaId} onChange={handleChange} disabled={editMode}>
                                <option value="">Izaberite kompaniju</option>
                                {companies.map(comp => <option key={comp.id} value={comp.id}>{comp.naziv}</option>)}
                            </select>

                            {/* Dropdown za lokaciju */}
                            <select className="w-75 mb-3" name="lokacijaId" value={userForm.lokacijaId} onChange={handleChange} disabled={!userForm.kompanijaId}>
                                <option value="">Izaberite lokaciju</option>
                                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.adresa}</option>)}
                            </select>

                            {/* Dropdown za rolu */}
                            <select className="w-75 mb-3" name="roleId" value={userForm.roleId} onChange={handleChange}>
                                <option value="">Izaberite rolu</option>
                                {roles.map(role => <option key={role.id} value={role.id}>{role.naziv}</option>)}
                            </select>

                            {/* Password - samo kod dodavanja korisnika */}
                            <input type="password" name="password" className="w-75 mb-3" style={{ fontFamily: "Montserrat", fontSize: 14 }}
                                value={userForm.password} onChange={handleChange} placeholder="Lozinka" disabled={editMode} autoComplete="new-password" />

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

export default AdminKorisnici;