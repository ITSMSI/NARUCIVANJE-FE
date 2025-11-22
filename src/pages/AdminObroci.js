// src/pages/AdminObroci.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://www.naruci.co.rs/api';

const AdminObroci = () => {
  const [obroci, setObroci] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/obrok/get/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setObroci(res.data);
    } catch (err) {
      if (err.response?.status === 401) window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div>Učitavanje...</div>;

  return (
    <div>
      <h2>Obroci</h2>
      <button onClick={fetchData}>Osveži</button>
      <table border="1" style={{width:'100%', marginTop:'20px'}}>
        <thead><tr><th>ID</th><th>Naziv</th><th>Opis</th><th>Cena</th><th>Status</th></tr></thead>
        <tbody>
          {obroci.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.naziv}</td>
              <td>{o.opis}</td>
              <td>{o.cena}</td>
              <td>{o.status ? 'Aktivan' : 'Neaktivan'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminObroci;