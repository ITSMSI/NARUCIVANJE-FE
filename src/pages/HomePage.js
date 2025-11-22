import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import NavBar from "../components/NavBar";


const HomePage = () => {
    const [show, setShow] = useState(false); 

    return (
        <div>
            <NavBar />


            {/* Hero sekcija */}
            <header className="text-center position-relative" style={{ backgroundImage: "url('/slike/home1.png')", backgroundSize: "cover", backgroundPosition: "center", height: "650px" }}>
                <div className="d-flex align-items-center justify-content-center h-100 text-white" >
                    <div className="p-5 " style={{ backgroundColor: "rgba(0, 0, 0, 0.1)", backdropFilter: "blur(15px)", borderRadius: "20px", overflow: "hidden"}}>
                        <h1 className="fw-bold" style={{ fontFamily: "Montserrat", fontSize: 32 }}>Spremni ste da ne brinete o <br/> toplim obrocima?</h1>
                        <button className="btn mt-3 w-50 fw-bold"
                            style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 16 }}
                            onClick={() => setShow(true)}>Kontaktirajte nas</button>
                    </div>
                </div>
            </header>

            {/* O nama */}
            <section className="container my-5 " style={{ maxWidth: "80%" }}>
                <div className="row align-items-center bg-white shadow-lg rounded p-4 overflow-hidden" style={{ borderRadius: "20px" }}>
                    <div className="col-md-7">
                        <img src="/slike/home2.jpg" alt="home2" className="img-fluid" style={{ width: "100%", height: "450px", objectFit: "cover", borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px" }} />
                    </div>
                    <div className="col-md-5">
                        <h2 className="fw-bold mb-3" style={{ color: "#424242", fontFamily: "Montserrat", fontSize: 32 }}>O nama</h2>
                        <p style={{ color: "#757575", fontSize: 18, fontFamily: "Montserrat"}}>
                            Idealna aplikacija za restorane i firme koji hrane zaposlene na poslu. 
                            Za FIRME najbolji način da svojim zaposlenima pruže savršeno zadovoljstvo narudžbe hrane na poslu.
                            Za ZAPOSLENE omiljena aplikacija za narudžbu najdražih obroka sa bilo koje lokacije i u bilo koje vrijeme.
                        </p>
                        <button className="btn mt-3 w-50 fw-bold"
                            style={{ backgroundColor: "#486F5B", color: "white", fontFamily: "Montserrat", fontSize: 16 }}
                            onClick={() => setShow(true)}>Postanimo partneri</button>
                    </div>
                </div>
            </section>

            {/* Sekcija 'Šta nudimo?' */}
            <section className="container text-center my-5 " style={{ maxWidth: "80%" }}>
                <h2 className="fw-bold" style={{ color: "#486F5B", fontFamily: "Montserrat", fontSize: 32}}>Šta nudimo?</h2>
                <div className="row mt-4 mb-5 ">
                    {[
                        { src: "/slike/home3.jpg", title: "Porudžbine", text: "Firme imaju mogućnost zbirnih narudžbi za više radnika odjednom." },
                        { src: "/slike/home4.jpg", title: "Izveštaji", text: "Pregled izvještaja koji obuhvataju: pregled svih narudžbi, obroka, kao i evidenciju koji radnici su izvršili narudžbu." },
                        { src: "/slike/home5.jpg", title: "Korisnici", text: "Firma ima mogućnosta dodavanja novih radnika, deaktiviranje radnika za vrijeme godišnjeg odmora ." }
                    ].map((item, index) => (
                        <div key={index} className="col-md-4 position-relative">
                            <img src={item.src} className="img-fluid " alt={item.title} style={{ width: "100%", height: "350px", objectFit: "cover", borderRadius:"20px"}} />
                            <div className="position-absolute bottom-0 p-3 d-flex flex-column align-items-center justify-content-center" 
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.1)", backdropFilter: "blur(15px)", height: "40%", width: "95.5%", overflow: "hidden", borderRadius: "0 0 20px 20px"}}>
                                <h4 className="text-white fw-bold" style={{  fontSize: 23, fontFamily: "Montserrat"}}>{item.title}</h4>
                                <p className="text-white" style={{  fontSize: 16, fontFamily: "Montserrat"}}>{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Popup modal za kontakt */}
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="text-white">Kontakt informacije</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-white" style={{ fontSize: 20, fontFamily: "Montserrat"}}><strong>Telefon:</strong> +381 11 455 5043</p>
<a href="mailto:office@itsmsi.com" className="text-white" style={{ fontSize: 20, fontFamily: "Montserrat"}}><strong>office@itsmsi.com</strong></a>                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Zatvori</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default HomePage;