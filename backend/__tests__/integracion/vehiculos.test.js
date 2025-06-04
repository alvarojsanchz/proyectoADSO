//backend/__tests__/integracion/vehiculos.test.js

/* global describe, test, expect, beforeAll */

const request = require('supertest');
const app = 'http://localhost:3000';

describe('Pruebas de Integración - Vehículos', () => {
  let testEmail;
  let testPassword;
  let carroTipoId; // ID dinámico para tipo "Carro"

  beforeAll(async () => {
    // Crear usuario de prueba
    testEmail = `vehiculos${Date.now()}@test.com`;
    testPassword = '123456';
    
    const response = await request(app)
      .post('/api/registro')
      .send({
        nombre: 'Test Vehiculos',
        direccion: 'Test',
        capacidad: '5',
        email: testEmail,
        password: testPassword
      });
      
    if (response.status !== 201) {
      console.error('Error en setup:', response.body);
      throw new Error(`Setup falló: ${response.status}`);
    }
    
    // Verificar que se crearon las tarifas y obtener ID de "Carro"
    const tarifasResponse = await request(app)
      .get(`/api/tarifas/${testEmail}`);
      
    if (tarifasResponse.status !== 200) {
      console.error('Error obteniendo tarifas:', tarifasResponse.body);
      throw new Error(`No se pudieron obtener tarifas: ${tarifasResponse.status}`);
    }
    
    const tarifas = tarifasResponse.body;
    const carroTarifa = tarifas.find(t => t.tipo_vehiculo === 'Carro');
    
    if (!carroTarifa) {
      throw new Error('No se encontró tarifa para tipo "Carro"');
    }
    
    carroTipoId = carroTarifa.id_tipo_vehiculo;
    console.log(`Usando tipo vehículo ID: ${carroTipoId} para "Carro"`);
  });

  // CP_RF04_001: Ingreso de vehículo válido
  test('CP_RF04_001: Ingreso de vehículo válido', async () => {
    const response = await request(app)
      .post('/api/ingreso')
      .send({
        placa: 'ABC123',
        id_tipo_vehiculo: carroTipoId,
        email: testEmail
      });

    if (response.status !== 200) {
      console.error('CP_RF04_001 Error response:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('ticket_id');
    expect(response.body.data).toHaveProperty('espacio');
    expect(response.body.data.placa).toBe('ABC123');
  });

  // CP_RF04_002: Vehículo duplicado
  test('CP_RF04_002: Error vehículo duplicado', async () => {
    // Primero registrar un vehículo
    const firstResponse = await request(app)
      .post('/api/ingreso')
      .send({
        placa: 'DUP123',
        id_tipo_vehiculo: carroTipoId,
        email: testEmail
      });
    
    if (firstResponse.status !== 200) {
      console.error('CP_RF04_002 First registration error:', firstResponse.body);
    }
    
    // Intentar registrar el mismo vehículo
    const response = await request(app)
      .post('/api/ingreso')
      .send({
        placa: 'DUP123',
        id_tipo_vehiculo: carroTipoId,
        email: testEmail
      });

    if (response.status !== 400) {
      console.error('CP_RF04_002 Duplicate error response:', response.body);
    }

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('vehículo ya está en el estacionamiento');
  });

  // CP_RF04_003: Sin espacios disponibles
  test('CP_RF04_003: Sin espacios disponibles', async () => {
    // Llenar el estacionamiento (capacidad: 5)
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/api/ingreso')
        .send({
          placa: `FULL${i}`,
          id_tipo_vehiculo: carroTipoId,
          email: testEmail
        });
    }

    // Intentar uno más
    const response = await request(app)
      .post('/api/ingreso')
      .send({
        placa: 'OVERFLOW',
        id_tipo_vehiculo: carroTipoId,
        email: testEmail
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('No hay espacios disponibles');
  });
});