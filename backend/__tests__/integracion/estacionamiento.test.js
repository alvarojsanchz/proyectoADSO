//backend/__tests__/integracion/estacionamiento.test.js

/* global describe, test, expect, beforeAll */

const request = require('supertest');
const app = 'http://localhost:3000';

describe('Pruebas de Integración - Estacionamiento RF06', () => {
  let testEmail;
  let testPassword;
  let carroTipoId;

  beforeAll(async () => {
    // Crear usuario de prueba
    testEmail = `estacionamiento${Date.now()}@test.com`;
    testPassword = '123456';
    
    const response = await request(app)
      .post('/api/registro')
      .send({
        nombre: 'Test Estacionamiento',
        direccion: 'Test Address',
        ciudad: 'Test City',
        capacidad: '10',
        email: testEmail,
        password: testPassword
      });
      
    if (response.status !== 201) {
      console.error('Error en setup estacionamiento:', response.body);
      throw new Error(`Setup falló: ${response.status}`);
    }
    
    // Obtener ID de tipo "Carro" para los tests que necesiten vehículos
    const tarifasResponse = await request(app)
      .get(`/api/tarifas/${testEmail}`);
      
    if (tarifasResponse.status === 200) {
      const tarifas = tarifasResponse.body;
      const carroTarifa = tarifas.find(t => t.tipo_vehiculo === 'Carro');
      if (carroTarifa) {
        carroTipoId = carroTarifa.id_tipo_vehiculo;
      }
    }
  });

  // CP_RF06_001: Actualizar información básica
  test('CP_RF06_001: Actualizar información básica', async () => {
    const response = await request(app)
      .put(`/api/estacionamiento/${testEmail}`)
      .send({
        nombre: 'Nuevo nombre',
        direccion: 'Nueva direccion',
        ciudad: 'Nueva ciudad',
        capacidad: '15'  // Aumentar capacidad
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('actualizada correctamente');
    
    // Verificar que los cambios se aplicaron
    const verificarResponse = await request(app)
      .get(`/api/estacionamiento/${testEmail}`);
      
    expect(verificarResponse.status).toBe(200);
    expect(verificarResponse.body.nombre).toBe('Nuevo nombre');
    expect(verificarResponse.body.capacidad).toBe(15);
  });

  // CP_RF06_002: Cambio de contraseña válido
  test('CP_RF06_002: Cambio de contraseña válido', async () => {
    const newPassword = 'nuevaPassword123';
    
    const response = await request(app)
      .put(`/api/cambiar-password/${testEmail}`)
      .send({
        password_actual: testPassword,
        password_nueva: newPassword
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('actualizada correctamente');
    
    // Verificar que el login funciona con la nueva contraseña
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: testEmail,
        password: newPassword
      });
      
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    
    // Actualizar password para siguientes tests
    testPassword = newPassword;
  });

  // CP_RF06_003: Validación reducción capacidad con espacios ocupados
  test('CP_RF06_003: Validación reducción capacidad', async () => {
    // Primero, registrar algunos vehículos para ocupar espacios
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post('/api/ingreso')
        .send({
          placa: `CAP${i}`,
          id_tipo_vehiculo: carroTipoId,
          email: testEmail
        });
    }
    
    // Intentar reducir capacidad por debajo de los espacios ocupados
    const response = await request(app)
      .put(`/api/estacionamiento/${testEmail}`)
      .send({
        nombre: 'Test Estacionamiento',
        direccion: 'Test Address',
        ciudad: 'Test City',
        capacidad: '3'  // Menor que los 5 vehículos registrados
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('espacios ocupados');
  });

  // Test adicional: Validación de contraseña incorrecta
  test('CP_RF06_002b: Error con contraseña actual incorrecta', async () => {
    const response = await request(app)
      .put(`/api/cambiar-password/${testEmail}`)
      .send({
        password_actual: 'contraseñaIncorrecta',
        password_nueva: 'nuevaPassword456'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Contraseña actual incorrecta');
  });

  // Test adicional: Validación de campos requeridos
  test('CP_RF06_001b: Error campos requeridos faltantes', async () => {
    const response = await request(app)
      .put(`/api/estacionamiento/${testEmail}`)
      .send({
        nombre: 'Solo nombre'
        // Faltan direccion y capacidad
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('requeridos');
  });
}); 