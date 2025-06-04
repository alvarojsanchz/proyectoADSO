/* global beforeAll, jest */

const mysql = require('mysql2/promise');

// Configuración de base de datos de testing
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sistema_estacionamiento_test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para limpiar la base de datos de testing
const clearTestDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    // Deshabilitar foreign key checks temporalmente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Limpiar todas las tablas en orden correcto
    await connection.query('DELETE FROM Pago');
    await connection.query('DELETE FROM Ticket');
    await connection.query('DELETE FROM Vehiculo');
    await connection.query('DELETE FROM Espacio');
    await connection.query('DELETE FROM Tarifa');
    await connection.query('DELETE FROM Estacionamiento');
    await connection.query('DELETE FROM TipoVehiculo');
    
    // Restablecer foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
  } finally {
    connection.release();
  }
};

// Función para inicializar datos básicos de testing
const seedTestDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    // Insertar tipos de vehículo básicos
    await connection.query(`
      INSERT IGNORE INTO TipoVehiculo (nombre) VALUES 
      ('Bus'), ('Carro'), ('Moto')
    `);
    
  } finally {
    connection.release();
  }
};

// Configuración global para todos los tests
beforeAll(async () => {
  // Asegurar que estamos en entorno de testing
  process.env.NODE_ENV = 'test';
  
  console.log('🧹 Limpiando base de datos de testing...');
  await clearTestDatabase();
  
  console.log('🌱 Inicializando datos básicos...');
  await seedTestDatabase();
  
  console.log('✅ Base de datos de testing lista');
});

// Configuración de timeout para operaciones de BD
jest.setTimeout(10000); 