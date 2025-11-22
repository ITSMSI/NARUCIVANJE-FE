import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LozinkaPage = () => {
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [emailError, setEmailError] = useState("");
    const [poljaError, setPoljaError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Resetovanje grešaka
        setEmailError("");
        setErrorMessage("");
        setPoljaError("");
        // Validacija emaila
        if (!email.match(emailRegex)) {
            setEmailError("Unesite validnu email adresu.");
            return;
        }
        if (!email) {
            setPoljaError("Sva polja moraju biti popunjena.");
            return;
        }
        const userData = {
            email: email,
        };
        try {
            setIsSubmitting(true);
            // Slanje POST zahteva ka backendu
            const response = await fetch("https://naruci.co.rs/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            // Just read the response as text and don't try to parse it as JSON
            const responseText = await response.text();
            if (response.ok) {
                // Successfully sent the password reset request
                setSuccessMessage("Link za promenu lozinke je poslat na Vaš email, pratite uputstva!");
                setEmail("");
                // After 3 seconds, redirect to login
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                // Something went wrong
                setErrorMessage("Došlo je do greške pri slanju podataka.");
            }
        } catch (error) {
            console.error("Greška prilikom slanja:", error);
            setErrorMessage("Došlo je do greške pri slanju podataka.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="vh-100 d-flex">
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
                        Već znate lozinku?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className="btn p-0 fw-bold"
                            style={{ color: "#486F5B", fontFamily: "Montserrat", fontSize: 18, background: "none", border: "none" }}
                        >
                            Prijavite se ovde
                        </button>
                    </p>
                    <p className="text-center mt-3" style={{ color: "#9E9E9E", fontFamily: "Montserrat", fontSize: 18 }}>
                        _______________  ili nastavite  _______________
                    </p>
                    {successMessage ? (
                        <div className="alert alert-success mt-4">
                            <p className="text-center mb-0">{successMessage}</p>
                            <p className="text-center mb-0">Bićete preusmereni na stranicu za prijavu...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3 mt-4">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Unesite vaš email"
                                    style={{ fontFamily: "Montserrat", fontSize: 14, height: 41 }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {emailError && <div className="text-danger">{emailError}</div>}
                                {poljaError && <div className="text-danger">{poljaError}</div>}
                            </div>
                            <button
                                type="submit"
                                className="btn w-100 mb-5 fw-bold"
                                disabled={isSubmitting}
                                style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 18 }}>
                                {isSubmitting ? "Slanje..." : "Promeni lozinku"}
                            </button>
                            {errorMessage && (
                                <div className="alert alert-danger mt-3">
                                    <strong>Greška: </strong> {errorMessage}
                                </div>
                            )}
                        </form>
                    )}
                    <button
                        onClick={() => navigate("/")}
                        className="btn w-100 p-0 fw-bold mt-5"
                        style={{ color: "#486F5B", fontFamily: "Montserrat", fontSize: 18, background: "none", border: "none" }} >
                        ← Vrati se na početnu stranicu
                    </button>
                </div>
            </div>
        </div>
    );
}
export default LozinkaPage;