//backend/__tests__/integracion/api.test.js

/* global describe, test, expect */
const request = require('supertest');


// Prueba endpoints básicos
describe('API de ParkIO - Pruebas de Integración', () => {
  
  const API_BASE = 'http://localhost:3000';
  
  test('Obtener tipos de vehículo', async () => {
    const response = await request(API_BASE)
      .get('/api/tipos-vehiculo');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id_tipo_vehiculo');
      expect(response.body[0]).toHaveProperty('nombre');
    }
  });

  test('Rechazar login con credenciales vacías', async () => {
    const response = await request(API_BASE)
      .post('/api/login')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

});