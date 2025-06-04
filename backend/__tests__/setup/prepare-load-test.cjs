const request = require('supertest');

// Configurar entorno de testing
process.env.NODE_ENV = 'test';

const app = 'http://localhost:3000';

async function prepareLoadTestData() {
  console.log('🔥 Preparando datos para pruebas de carga en BD de testing...');
  
  const users = [
    { email: 'load1@test.com', password: '123456', nombre: 'Load Test 1', capacidad: '100' },
    { email: 'load2@test.com', password: '123456', nombre: 'Load Test 2', capacidad: '200' },
    { email: 'load3@test.com', password: '123456', nombre: 'Load Test 3', capacidad: '150' }
  ];

  for (const user of users) {
    try {
      const response = await request(app)
        .post('/api/registro')
        .send({
          nombre: user.nombre,
          direccion: 'Load Test Street',
          ciudad: 'Load Test City',
          capacidad: user.capacidad,
          email: user.email,
          password: user.password
        });
        
      if (response.status === 201) {
        console.log(`✓ Usuario ${user.email} creado exitosamente`);
        
        // Verificar que se crearon las tarifas
        const tarifasResponse = await request(app).get(`/api/tarifas/${user.email}`);
        if (tarifasResponse.status === 200 && tarifasResponse.body.length > 0) {
          console.log(`  ✓ Tarifas configuradas: ${tarifasResponse.body.length} tipos`);
        }
      } else {
        console.log(`⚠️ Usuario ${user.email}: ${response.body.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.log(`❌ Error creando usuario ${user.email}:`, error.message);
    }
  }
  
  // Obtener ID de tipo "Carro" para el YAML
  try {
    const tiposResponse = await request(app).get('/api/tipos-vehiculo');
    if (tiposResponse.status === 200) {
      const tipos = tiposResponse.body;
      const carroTipo = tipos.find(t => t.nombre === 'Carro');
      if (carroTipo) {
        console.log(`📋 Para el YAML usar: id_tipo_vehiculo: ${carroTipo.id_tipo_vehiculo} (Carro)`);
      }
    }
  } catch (error) {
    console.log('⚠️ No se pudieron obtener tipos de vehículo');
  }
  
  console.log('🎯 Datos de prueba de carga preparados!');
}

prepareLoadTestData(); 