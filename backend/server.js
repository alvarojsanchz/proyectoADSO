require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      
  password: 'root',      
  database: 'sistema_estacionamiento',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Prueba de conexión
app.get('/api/test', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT 1 + 1 AS solution');
      res.json({ 
        message: '¡Conexión exitosa a la base de datos!',
        result: rows[0].solution,
        database: 'sistema_estacionamiento'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor local: http://localhost:${PORT}`));