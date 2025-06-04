-- Script para crear base de datos de testing
CREATE DATABASE IF NOT EXISTS sistema_estacionamiento_test;
USE sistema_estacionamiento_test;

-- Tabla Estacionamiento
CREATE TABLE IF NOT EXISTS Estacionamiento (
    id_estacionamiento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100),
    capacidad INT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla TipoVehiculo
CREATE TABLE IF NOT EXISTS TipoVehiculo (
    id_tipo_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla Vehiculo
CREATE TABLE IF NOT EXISTS Vehiculo (
    placa VARCHAR(10) PRIMARY KEY,
    id_tipo_vehiculo INT,
    FOREIGN KEY (id_tipo_vehiculo) REFERENCES TipoVehiculo(id_tipo_vehiculo)
);

-- Tabla Espacio
CREATE TABLE IF NOT EXISTS Espacio (
    id_espacio INT AUTO_INCREMENT PRIMARY KEY,
    id_estacionamiento INT,
    numero VARCHAR(10) NOT NULL,
    estado ENUM('disponible', 'ocupado', 'mantenimiento') DEFAULT 'disponible',
    FOREIGN KEY (id_estacionamiento) REFERENCES Estacionamiento(id_estacionamiento) ON DELETE CASCADE,
    UNIQUE KEY unique_espacio_estacionamiento (id_estacionamiento, numero)
);

-- Tabla Tarifa
CREATE TABLE IF NOT EXISTS Tarifa (
    id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_vehiculo INT,
    id_estacionamiento INT,
    valor DECIMAL(10,2) NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_vehiculo) REFERENCES TipoVehiculo(id_tipo_vehiculo),
    FOREIGN KEY (id_estacionamiento) REFERENCES Estacionamiento(id_estacionamiento) ON DELETE CASCADE,
    UNIQUE KEY unique_tarifa_tipo_estacionamiento (id_tipo_vehiculo, id_estacionamiento)
);

-- Tabla Ticket
CREATE TABLE IF NOT EXISTS Ticket (
    id_ticket INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10),
    id_espacio INT,
    id_tarifa INT,
    fecha_hora_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_hora_salida TIMESTAMP NULL,
    estado ENUM('activo', 'cerrado') DEFAULT 'activo',
    FOREIGN KEY (placa) REFERENCES Vehiculo(placa),
    FOREIGN KEY (id_espacio) REFERENCES Espacio(id_espacio),
    FOREIGN KEY (id_tarifa) REFERENCES Tarifa(id_tarifa)
);

-- Tabla Pago
CREATE TABLE IF NOT EXISTS Pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_ticket INT,
    valor_pago DECIMAL(10,2) NOT NULL,
    forma_pago ENUM('efectivo', 'tarjeta', 'digital') DEFAULT 'efectivo',
    fecha_hora_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ticket) REFERENCES Ticket(id_ticket)
);

-- Insertar tipos de vehículo básicos
INSERT IGNORE INTO TipoVehiculo (nombre) VALUES 
('Bus'), 
('Carro'), 
('Moto'); 