
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react"; // Importuj useState
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; // Importuj useNavigate


const LoginPage = ({updateToken}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [poljaError, setPoljaError] = useState("");
  const [emailError, setEmailError] = useState(""); // Za email grešku

  // Inicijalizacija navigate funkcije
  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Regularni izraz za validaciju emaila


  // Funkcija koja se poziva kada se forma pošalje
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sprečava podrazumevano ponašanje forme

    // Resetovanje grešaka
    setEmailError("");
    setErrorMessage("");
    setPoljaError("");

    // Validacija emaila
    if (!email.match(emailRegex)) {
      setEmailError("Unesite validnu email adresu.");
      return;
    }

    if (!email || !password) {
      setPoljaError("Sva polja moraju biti popunjena.");
      return;
    }

    const userData = {
      email: email,
      password: password,
    };

    try {
      // Slanje POST zahteva ka backendu
      const response = await fetch("http://127.0.0.1:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();

        updateToken(data.token);
        const decodedToken = jwtDecode(data.token);
        // Preusmeravanje korisnika na stranicu za naručivanje
        if (decodedToken.role === "ROLE_ADMIN") {
          navigate("/admin");
        } else {
          navigate("/meni");
        }
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Došlo je do greške pri prijavljivanju."); // Ako nije uspešno, postavi grešku
      }
    } catch (error) {
      console.error("Greška prilikom slanja:", error);
      setErrorMessage("Vaš nalog trenutno nije aktivan.");
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
          <h2 className="text-center fw-bold" style={{ color: "#424242", fontFamily: "Montserrat", fontSize: 28 }}>Dobrodošli!</h2>
          <h3 className="text-center fw-bold mt-5" style={{ color: "#424242", fontFamily: "Montserrat", fontSize: 28 }}>Prijavite se da naručite</h3>

          <p className="text-center mt-5" style={{ color: "#9E9E9E", fontFamily: "Montserrat", fontSize: 18 }}>
            Zaboravili ste lozinku?{" "}
            <button
              onClick={() => navigate("/lozinka")}
              className="btn p-0 fw-bold"
              style={{ color: "#486F5B", fontFamily: "Montserrat", fontSize: 18, background: "none", border: "none" }}
            >
              Promenite je ovde
            </button>
          </p>
          <p className="text-center mt-3" style={{ color: "#9E9E9E", fontFamily: "Montserrat", fontSize: 18 }}>
            _______________  ili nastavite  _______________
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 mt-4">
              <input type="email" className="form-control" placeholder="Unesite vaš email"
                style={{ fontFamily: "Montserrat", fontSize: 14, height: 41 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <div className="text-danger">{emailError}</div>}
            </div>
            <div className="mb-3 ">
              <input
                type="password" className="form-control" placeholder="Unesite vašu lozinku"
                style={{ fontFamily: "Montserrat", fontSize: 14, height: 41 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {poljaError && <div className="text-danger">{poljaError}</div>}
            </div>
            <button
              type="submit"
              className="btn w-100 mb-5 fw-bold"
              style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 18 }}>
              Prijavi se
            </button>
            {errorMessage && (
              <div className="alert alert-danger mt-3">
                <strong>Greška: </strong> {errorMessage}
              </div>
            )}
          </form>

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
};

export default LoginPage;