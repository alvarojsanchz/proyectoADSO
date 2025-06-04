//backend/__tests__/integracion/reportes.test.js

/* global describe, test, expect, beforeAll */

const request = require('supertest');
const app = 'http://localhost:3000';

describe('Pruebas de Integración - Reportes', () => {
  let testEmail;
  let testPassword;
  let carroTipoId;
  let busTipoId;

  beforeAll(async () => {
    // Crear usuario de prueba
    testEmail = `reportes${Date.now()}@test.com`;
    testPassword = '123456';
    
    const response = await request(app)
      .post('/api/registro')
      .send({
        nombre: 'Test Reportes',
        direccion: 'Test Address',
        capacidad: '10',
        email: testEmail,
        password: testPassword
      });
      
    if (response.status !== 201) {
      console.error('Error en setup reportes:', response.body);
      throw new Error(`Setup falló: ${response.status}`);
    }
    
    // Obtener IDs de tipos de vehículo
    const tarifasResponse = await request(app)
      .get(`/api/tarifas/${testEmail}`);
      
    if (tarifasResponse.status !== 200) {
      throw new Error(`No se pudieron obtener tarifas: ${tarifasResponse.status}`);
    }
    
    const tarifas = tarifasResponse.body;
    const carroTarifa = tarifas.find(t => t.tipo_vehiculo === 'Carro');
    const busTarifa = tarifas.find(t => t.tipo_vehiculo === 'Bus');
    
    if (!carroTarifa || !busTarifa) {
      throw new Error('No se encontraron tarifas para tipos de vehículo');
    }
    
    carroTipoId = carroTarifa.id_tipo_vehiculo;
    busTipoId = busTarifa.id_tipo_vehiculo;
    
    // Registrar algunos vehículos para tener espacios ocupados
    await request(app)
      .post('/api/ingreso')
      .send({
        placa: 'RPT001',
        id_tipo_vehiculo: carroTipoId,
        email: testEmail
      });
      
    await request(app)
      .post('/api/ingreso')
      .send({
        placa: 'RPT002',
        id_tipo_vehiculo: busTipoId,
        email: testEmail
      });
  });

  // CP_RF05_003: Reporte de ocupación completo
  test('CP_RF05_003: Reporte de ocupación completo', async () => {
    const response = await request(app)
      .get(`/api/reporte-ocupacion/${testEmail}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('estacionamiento');
    expect(response.body).toHaveProperty('ocupacion');
    expect(response.body.estacionamiento.nombre).toBe('Test Reportes');
    expect(response.body.estacionamiento.capacidad_total).toBe(10);
    expect(response.body.ocupacion.espacios_ocupados).toBeGreaterThan(0);
  });
});