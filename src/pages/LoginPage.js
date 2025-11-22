import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ updateToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [poljaError, setPoljaError] = useState("");
  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setErrorMessage("");
    setPoljaError("");

    if (!email.match(emailRegex)) {
      setEmailError("Unesite validnu email adresu.");
      return;
    }
    if (!email || !password) {
      setPoljaError("Sva polja moraju biti popunjena.");
      return;
    }

    try {
      const response = await fetch("https://www.naruci.co.rs/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.accessToken;
        const role = data.role; // ← backend već vraća role direktno!

        // Brišemo sve staro
        localStorage.clear();
        localStorage.setItem("token", token);
        localStorage.setItem("role", data.role);   
        updateToken(token);

        // Koristimo role iz odgovora – ne dekodiramo token uopšte!
        if (role === "ROLE_ADMIN") {
          navigate("/admin");
        } else {
          navigate("/meni");
        }
      } else {
        setErrorMessage(data.message || "Pogrešan email ili lozinka");
      }
    } catch (error) {
      setErrorMessage("Server nije dostupan");
    }
  };

  return (
    <div className="vh-100 d-flex">
      <div className="col-md-5 d-none d-md-block">
        <div className="h-100 bg-white opacity-75" style={{ backgroundImage: "url('/slike/login.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
      </div>

      <div className="col-md-7 d-flex align-items-center justify-content-center">
        <div className="w-70">
          <h2 className="text-center fw-bold" style={{ color: "#424242", fontFamily: "Montserrat", fontSize: 28 }}>Dobrodošli!</h2>
          <h3 className="text-center fw-bold mt-5" style={{ color: "#424242", fontFamily: "Montserrat", fontSize: 28 }}>Prijavite se da naručite</h3>

          <p className="text-center mt-5" style={{ color: "#9E9E9E", fontFamily: "Montserrat", fontSize: 18 }}>
            Zaboravili ste lozinku?{" "}
            <button onClick={() => navigate("/lozinka")} className="btn p-0 fw-bold" style={{ color: "#486F5B", fontFamily: "Montserrat", fontSize: 18, background: "none", border: "none" }}>
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
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <div className="text-danger">{emailError}</div>}
            </div>
            <div className="mb-3">
              <input type="password" className="form-control" placeholder="Unesite vašu lozinku"
                style={{ fontFamily: "Montserrat", fontSize: 14, height: 41 }}
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              {poljaError && <div className="text-danger">{poljaError}</div>}
            </div>
            <button type="submit" className="btn w-100 mb-5 fw-bold"
              style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 18 }}>
              Prijavi se
            </button>
            {errorMessage && <div className="alert alert-danger mt-3"><strong>Greška: </strong>{errorMessage}</div>}
          </form>

          <button onClick={() => navigate("/")} className="btn w-100 p-0 fw-bold mt-5"
            style={{ color: "#486F5B", fontFamily: "Montserrat", fontSize: 18, background: "none", border: "none" }}>
            ← Vrati se na početnu stranicu
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;