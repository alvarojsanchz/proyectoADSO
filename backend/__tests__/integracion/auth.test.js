//backend/__tests__/integracion/auth.test.js

/* global describe, test, expect */
const request = require('supertest');
const app = 'http://localhost:3000';

describe('Pruebas de Integración - Autenticación', () => {
  
  // CP_RF01_001: Registro exitoso
  test('CP_RF01_001: Registro exitoso con datos válidos', async () => {
    const nuevoUsuario = {
      nombre: 'Parking Test',
      direccion: 'Calle Test 123',
      ciudad: 'Test City',
      capacidad: '50',
      email: `test${Date.now()}@test.com`,
      password: '123456'
    };

    const response = await request(app)
      .post('/api/registro')
      .send(nuevoUsuario);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.capacidad).toBe(50);
  });

  // CP_RF01_002: Error email duplicado
  test('CP_RF01_002: Error al registrar email duplicado', async () => {
    const email = `duplicate${Date.now()}@test.com`;
    
    // Primer registro
    await request(app)
      .post('/api/registro')
      .send({
        nombre: 'Test',
        direccion: 'Test',
        capacidad: '10',
        email: email,
        password: '123456'
      });

    // Intento de duplicado
    const response = await request(app)
      .post('/api/registro')
      .send({
        nombre: 'Test2',
        direccion: 'Test2',
        capacidad: '20',
        email: email,
        password: '654321'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email ya está registrado');
  });

  // CP_RF01_003: Validación campos obligatorios
  test('CP_RF01_003: Validación de campos obligatorios', async () => {
    const response = await request(app)
      .post('/api/registro')
      .send({
        email: 'test@test.com'
        // Faltan campos requeridos
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Campos requeridos');
  });

  // CP_RF02_001: Login exitoso
  test('CP_RF02_001: Login exitoso', async () => {
    const email = `login${Date.now()}@test.com`;
    const password = '123456';
    
    // Primero registrar
    await request(app)
      .post('/api/registro')
      .send({
        nombre: 'Test Login',
        direccion: 'Test',
        capacidad: '10',
        email: email,
        password: password
      });

    // Luego login
    const response = await request(app)
      .post('/api/login')
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('nombre');
  });

  // CP_RF02_002: Credenciales incorrectas
  test('CP_RF02_002: Credenciales incorrectas', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'noexiste@test.com',
        password: 'incorrecta'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Credenciales incorrectas');
  });

  // CP_RF02_003: Campos vacíos
  test('CP_RF02_003: Campos vacíos en login', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Email y contraseña requeridos');
  });
});