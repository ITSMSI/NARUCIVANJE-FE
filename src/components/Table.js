import React, { useState } from "react";
import "./Dodatak.css";

const Table = ({ columns, data, rowsPerPage, onRowClick, selected }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    // Izračunavanje prikazanih redova na osnovu trenutne stranice
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

    // Funkcije za prelazak između stranica
    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        
        <div className="table p-4" style={{  borderRadius: "20px", overflow: "hidden", boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}>
            
            <table className="table table-hover " >
                <thead className="table-light">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={{ padding: "20px", fontFamily: "Montserrat", fontSize: 16, color: "#424242", backgroundColor: "white" }}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentRows.length > 0 ? (
                        currentRows.map((row, rowIndex) => (
                            <tr key={rowIndex} onClick={() => onRowClick(row)} className={
                                selected && String(row.id) === String(selected.id)
                                  ? "selected-row"
                                  : ""
                              }
                              style={{ cursor: "pointer" }}>
                                {Object.entries(row).filter(([key]) => key !== "id").map(([key, cell], cellIndex) => (
                                    <td key={cellIndex} style={{ padding: "20px", fontFamily: "Montserrat", fontSize: 15, color: "#424242" }}>
                                        {typeof cell === "string" && cell.length > 35
                                            ? cell.substring(0, 35) + "..."
                                            : cell}</td>
                                ))}
                            </tr>
                        ))

                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-danger text-center fw-bold" style={{ fontFamily: "Montserrat", fontSize: 25 }}>
                                Nema podataka
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Dugmad za paginaciju */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-3">
                    <button className="btn btn-outline-secondary me-2" onClick={prevPage} disabled={currentPage === 1}>
                        ← 
                    </button>
                    <span className="fw-bold" style={{ padding: "10px", fontFamily: "Montserrat", fontSize: 16, color: "#424242"}}>{currentPage} / {totalPages}</span>
                    <button className="btn btn-outline-secondary ms-2" onClick={nextPage} disabled={currentPage === totalPages}>
                        →
                    </button>
                </div>
            )}
        </div>
    );
};

export default Table;