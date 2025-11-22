import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Table from "../components/Table";

const AdminPregled = () => {
    const columns = ["Datum", "Korisnik", "Kompanija", "Lokacija", "Obrok"];
    const [data, setData] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState();
    const token = localStorage.getItem("token"); // 🔹 Uzimamo token iz storage-a

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [companies, setCompanies] = useState([]); // Sve kompanije
    const [selectedCompany, setSelectedCompany] = useState(""); // Izabrana kompanija
    const [locations, setLocations] = useState([]); // Lokacije za izabranu kompaniju
    const [selectedLocation, setSelectedLocation] = useState(""); // Izabrana lokacija

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

    // 🚀 1. Fetch podataka iz baze (API poziv)
    useEffect(() => {
        fetchCompanies();
    }, []);

    // Fetch kompanija iz baze
    const fetchCompanies = async () => {
        try {
            const response = await fetch("https://narucivanje-back.naruci.co.rs:8443/api/v1/kompanija/get/all", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju kompanija");
            
            const result = await response.json();
            setCompanies(result);
        } catch (error) {
            console.error("Greška pri dohvaćanju kompanija:", error);
        }
    };

    // Fetch lokacija kada korisnik odabere kompaniju
    const fetchLocations = async (kompanijaId) => {
        try {
            const response = await fetch(`https://narucivanje-back.naruci.co.rs:8443/api/v1/lokacija/get/kompanija/${kompanijaId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju lokacija");
            
            const result = await response.json();
            setLocations(result);
        } catch (error) {
            console.error("Greška pri dohvaćanju lokacija:", error);
        }
    };

    // Kada korisnik odabere kompaniju, dohvati njene lokacije
    const handleCompanyChange = (e) => {
        const kompanijaId = e.target.value;
        setSelectedCompany(kompanijaId);
        setSelectedLocation(""); // Resetujemo lokaciju
        if (kompanijaId) {
            fetchLocations(kompanijaId);
        };
    };

    const fetchPorudzb = async () => {
        if (!startDate || !endDate) {
            setErrorMsg("Morate uneti oba datuma!");
            return;
        }

        setErrorMsg(""); // Resetujemo grešku ako je sve ok
        if (!token) {
            console.error("Nema tokena, preusmeravanje na login...");
            return;
        }
        const params = new URLSearchParams();
        params.append("startDate", startDate);
        params.append("endDate", endDate);

        if (selectedCompany) params.append("kompanijaId", selectedCompany);
        if (selectedLocation) params.append("lokacijaId", selectedLocation);
        try {

            const response = await fetch(`https://narucivanje-back.naruci.co.rs:8443/api/v1/porudzbina/get/filter?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Greška pri učitavanju podataka");

            const result = await response.json();
            result.sort((a, b) => new Date(a.datum) - new Date(b.datum));
            const activeOrders = result.filter(porudzb => porudzb.status === true);
            const formattedData = activeOrders.map(porudzb => ({
                datum: porudzb.datum,
                korisnik: porudzb.korisnikIme+" "+ porudzb.korisnikPrezime,
                kompanija: porudzb.kompanijaNaziv,
                lokacija: porudzb.lokacijaAdresa,
                obrok: porudzb.obrokNaziv,
            }));
            setData(formattedData); // 🔹 Postavljanje podataka u useState
        } catch (error) {
            console.error("Greška pri dohvaćanju podataka:", error);
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
                    {/* Dropdown za kompanije */}
                    <select className="form-select w-100 mb-4" value={selectedCompany} onChange={handleCompanyChange}>
                        <option value="">Izaberite kompaniju</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>{company.naziv}</option>
                        ))}
                    </select>

                    {/* Dropdown za lokacije (dinamički) */}
                    <select className="form-select w-100 mb-4" value={selectedLocation} 
                        onChange={(e) => setSelectedLocation(e.target.value)} disabled={!selectedCompany}>
                        <option value="">Izaberite lokaciju</option>
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>{location.adresa}, {location.grad}</option>
                        ))}
                    </select>

                    {/* Prikaz greške ako su datumi prazni */}
                    {errorMsg && <p className="text-danger fw-bold">{errorMsg}</p>}

                    <button className="btn fw-bold w-100"
                        style={{ backgroundColor: "#CDDFD0", fontFamily: "Montserrat", fontSize: 15, color: "#486F5B" }}
                        onClick={fetchPorudzb}>
                        Pretraži</button>
                </div>

                {/* Glavni sadržaj */}
                <div className="container flex-grow-1 d-flex flex-column " style={{ height: "90%" }}>
                    <h2 className="fw-bold mb-4 mt-3" style={{ fontFamily: "Montserrat", fontSize: 27, color: "#424242" }}>Lista porudžbina</h2>
                    <div style={{ height: "calc(100% - 10px)" }}>
                        <Table columns={columns} data={data} onRowClick={() => {}} rowsPerPage={rowsPerPage} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPregled;