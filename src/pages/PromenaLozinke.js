import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react"; // Importuj useState
import { useNavigate, useLocation} from "react-router-dom"; // Importuj useNavigate
import "bootstrap/dist/css/bootstrap.min.css";


const PromenaLozinke = () => {

    const [password, setPassword] = useState("");
    const [password1, setPassword1] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [poljaError, setPoljaError] = useState("");

    // Inicijalizacija navigate funkcije
    const navigate = useNavigate();
    const location = useLocation();

    // Čitanje tokena iz URL query stringa, npr. /promena-lozinke?token=XYZ
    const queryParams = new URLSearchParams(location.search);
    const resetToken = queryParams.get("token");

    // Funkcija koja se poziva kada se forma pošalje
    const handleSubmit = async (e) => {
        e.preventDefault(); // Sprečava podrazumevano ponašanje forme


        // Resetovanje grešaka
        setErrorMessage("");
        setPoljaError("");

        if ( !password || !password1) {
            setPoljaError("Sva polja moraju biti popunjena.");
            return;
        }

        if (password !== password1) {
            setPoljaError("Lozinke se ne poklapaju.");
            return;
        }

        // Ako nema tokena, ne možemo resetovati lozinku
        if (!resetToken) {
            setErrorMessage("Token za resetovanje lozinke nije pronađen.");
            return;
        } 

        const userData = {
            password: password,
            token: resetToken // prosleđujemo token backendu
        };

        try {
            // Slanje POST zahteva ka backendu
            const response = await fetch("http://127.0.0.1:8080/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const data = await response.json();
                // Preusmeravanje korisnika na stranicu za naručivanje
                alert("Uspešno ste promenili lozinku, sada možete da se prijavite!");
                navigate("/login");
            } else {
                const data = await response.json();
                setErrorMessage(data.message || "Došlo je do greške pri promeni lozinke."); // Ako nije uspešno, postavi grešku
            }
        } catch (error) {
            console.error("Greška prilikom slanja:", error);
            setErrorMessage("Došlo je do greške pri slanju podataka.");
        }
    };


    return (
        <div className=" vh-100 d-flex">
            {/* Leva strana */}
            <div className="col-md-5 d-none d-md-block">
                <div
                    className="h-100 bg-white opacity-75"
                    style={{ backgroundImage: "url('/slike/login.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
            </div>

            {/* Desna strana */}
            <div className="col-md-7 d-flex align-items-center justify-content-center">
                <div className="w-70">
                    <h2 className="text-center fw-bold" style={{ color: "#424242", fontFamily: "Montserrat", fontSize: 28 }}>Promena lozinke</h2>
                    

                    
                    <p className="text-center mt-5" style={{ color: "#9E9E9E", fontFamily: "Montserrat", fontSize: 18 }}>
                        _______________  nastavite  _______________
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 ">
                            <input
                                type="password" className="form-control" placeholder="Unesite vašu lozinku"
                                style={{ fontFamily: "Montserrat", fontSize: 14, height: 41 }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-3 ">
                            <input
                                type="password" className="form-control" placeholder="Potvrdite lozinku"
                                style={{ fontFamily: "Montserrat", fontSize: 14, height: 41 }}
                                value={password}
                                onChange={(e) => setPassword1(e.target.value)}
                            />
                            {poljaError && <div className="text-danger">{poljaError}</div>}
                        </div>
                        <button
                            type="submit"
                            className="btn w-100 mb-5 fw-bold"
                            style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 18 }}>
                            Promeni lozinku
                        </button>
                        {errorMessage && (
                            <div className="alert alert-danger mt-3">
                                <strong>Greška: </strong> {errorMessage}
                            </div>
                        )}
                    </form>

                    
                </div>
            </div>


        </div>
    );
}

export default PromenaLozinke;