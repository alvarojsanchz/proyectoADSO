//backend/server.js
import cors from 'cors';
import express from 'express';
import mysql from 'mysql2/promise';


const app = express();


// CORS para desarrollo
app.use(cors({
    origin: ['http://localhost:19006', 'exp://192.168.1.2:19000'],
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Pool de conexiones optimizado
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sistema_estacionamiento',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Registro
app.post('/api/registro', async (req, res) => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
        const { nombre, direccion, ciudad, capacidad, email, password } = req.body;
        
        // Validación de campos obligatorios
        if (!nombre || !direccion || !capacidad || !email || !password) {
            return res.status(400).json({ error: 'Campos requeridos faltantes' });
        }
        
        const capacidadNum = parseInt(capacidad);
        if (isNaN(capacidadNum) || capacidadNum <= 0 || capacidadNum > 999) {
            return res.status(400).json({ error: 'Capacidad debe ser un número entre 1 y 999' });
        }
        
        // Verificar si el email ya existe
        const [existingUser] = await connection.query(
            'SELECT id_estacionamiento FROM Estacionamiento WHERE email = ?',
            [email.toLowerCase()]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        
        // Insertar estacionamiento
        const [estacionamientoResult] = await connection.query(
            `INSERT INTO Estacionamiento (nombre, direccion, ciudad, capacidad, email, password)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre.trim(), direccion.trim(), ciudad?.trim() || '', capacidadNum, email.toLowerCase(), password]
        );
        
        const idEstacionamiento = estacionamientoResult.insertId;
        
        // Crear tipos de vehículo si no existen
        const tiposConfig = [
          { nombre: 'Bus' },
          { nombre: 'Carro' },
          { nombre: 'Moto' }
        ];
        
        for (const { nombre: tipoNombre } of tiposConfig) {
          await connection.query(
            `INSERT IGNORE INTO TipoVehiculo (nombre) VALUES (?)`,
            [tipoNombre]
          );
        }
        
        // Obtener IDs de tipos
        const [tipos] = await connection.query(
            'SELECT id_tipo_vehiculo, nombre FROM TipoVehiculo ORDER BY nombre'
        );
        
        // Insertar tarifas por defecto
        const tarifasDefault = [
            { tipo: 'Moto', valor: 2000 },
            { tipo: 'Carro', valor: 3000 },
            { tipo: 'Bus', valor: 4000 }
        ];
        
        for (const tarifa of tarifasDefault) {
            const tipo = tipos.find(t => t.nombre === tarifa.tipo);
            if (tipo) {
                await connection.query(
                    `INSERT INTO Tarifa (id_tipo_vehiculo, id_estacionamiento, valor) VALUES (?, ?, ?)`,
                    [tipo.id_tipo_vehiculo, idEstacionamiento, tarifa.valor]
                );
            }
        }
        
        // Generar espacios
        const espacios = [];
        for (let i = 1; i <= capacidadNum; i++) {
            espacios.push([idEstacionamiento, i.toString().padStart(3, '0'), 'disponible']);
        }
        
        if (espacios.length > 0) {
            await connection.query(
                `INSERT INTO Espacio (id_estacionamiento, numero, estado) VALUES ?`,
                [espacios]
            );
        }
        
        await connection.commit();
        
        res.status(201).json({
            success: true,
            message: 'Registro completado exitosamente',
            data: { id: idEstacionamiento, capacidad: capacidadNum }
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error en registro:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    } finally {
        connection.release();
    }
});

// Tipos de vehículo
app.get('/api/tipos-vehiculo', async (req, res) => {
  try {
    const [tipos] = await pool.query(`
      SELECT
        id_tipo_vehiculo,
        nombre
      FROM TipoVehiculo
      ORDER BY nombre
    `);

    res.json(tipos);
  } catch (error) {
    console.error('Error cargando tipos:', error);
    res.status(500).json({ error: 'Error al cargar tipos de vehículo' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }
        
        const [users] = await pool.query(
            'SELECT * FROM Estacionamiento WHERE email = ? AND password = ?',
            [email.toLowerCase(), password]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        
        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener datos del usuario
app.get('/api/user/:email', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT nombre, capacidad FROM Estacionamiento WHERE email = ?',
            [req.params.email]
        );
        res.json(rows[0] || {});
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
});

//Endpoint de ingreso
app.post('/api/ingreso', async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { placa, id_tipo_vehiculo, email } = req.body;

    if (!placa || !id_tipo_vehiculo || !email) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Obtener el estacionamiento
    const [estacionamiento] = await connection.query(
      'SELECT id_estacionamiento FROM Estacionamiento WHERE email = ?',
      [email]
    );

    if (estacionamiento.length === 0) {
      return res.status(404).json({ error: 'Estacionamiento no encontrado' });
    }

    const idEstacionamiento = estacionamiento[0].id_estacionamiento;

    // Verificar si el vehículo ya está en el estacionamiento
    const [vehiculoActivo] = await connection.query(`
      SELECT t.id_ticket FROM Ticket t
      JOIN Espacio e ON t.id_espacio = e.id_espacio
      WHERE t.placa = ? AND e.id_estacionamiento = ? AND t.estado = 'activo'
    `, [placa.toUpperCase(), idEstacionamiento]);

    if (vehiculoActivo.length > 0) {
      return res.status(400).json({ error: 'El vehículo ya está en el estacionamiento' });
    }

    // Buscar espacio disponible (CORREGIDO: obtener también el número)
    const [espacioDisponible] = await connection.query(`
      SELECT id_espacio, numero 
      FROM Espacio 
      WHERE id_estacionamiento = ? AND estado = "disponible" 
      ORDER BY CAST(numero AS UNSIGNED) ASC 
      LIMIT 1
    `, [idEstacionamiento]);

    if (espacioDisponible.length === 0) {
      return res.status(400).json({ error: 'No hay espacios disponibles' });
    }

    const { id_espacio, numero } = espacioDisponible[0];

    // Insertar o actualizar vehículo
    await connection.query(
      'INSERT INTO Vehiculo (placa, id_tipo_vehiculo) VALUES (?, ?) ON DUPLICATE KEY UPDATE id_tipo_vehiculo = VALUES(id_tipo_vehiculo)',
      [placa.toUpperCase(), id_tipo_vehiculo]
    );

    // Obtener tarifa
    const [tarifa] = await connection.query(
      'SELECT id_tarifa FROM Tarifa WHERE id_tipo_vehiculo = ? AND id_estacionamiento = ?',
      [id_tipo_vehiculo, idEstacionamiento]
    );

    if (tarifa.length === 0) {
      return res.status(400).json({ error: 'Tarifa no configurada para este tipo de vehículo' });
    }

    // Crear ticket
    const [ticketResult] = await connection.query(
      'INSERT INTO Ticket (placa, id_espacio, id_tarifa, fecha_hora_entrada) VALUES (?, ?, ?, NOW())',
      [placa.toUpperCase(), id_espacio, tarifa[0].id_tarifa]
    );

    // Marcar espacio como ocupado
    await connection.query(
      'UPDATE Espacio SET estado = "ocupado" WHERE id_espacio = ?',
      [id_espacio]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Vehículo registrado exitosamente',
      data: {
        ticket_id: ticketResult.insertId,
        placa: placa.toUpperCase(),
        espacio: numero 
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en ingreso:', error);
    res.status(500).json({ error: 'Error al registrar ingreso' });
  } finally {
    connection.release();
  }
});

//Endpoint de salida
app.post('/api/salida', async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { placa, email } = req.body;

    if (!placa || !email) {
      return res.status(400).json({ error: 'Placa y email requeridos' });
    }

    // Obtener ticket activo (CORREGIDO: incluir número del espacio)
    const [ticket] = await connection.query(`
      SELECT
        t.id_ticket,
        t.id_espacio,
        t.fecha_hora_entrada,
        tar.valor,
        e.numero as numero_espacio
      FROM Ticket t
      JOIN Espacio e ON t.id_espacio = e.id_espacio
      JOIN Estacionamiento est ON e.id_estacionamiento = est.id_estacionamiento
      JOIN Tarifa tar ON t.id_tarifa = tar.id_tarifa
      WHERE t.placa = ? AND est.email = ? AND t.estado = 'activo'
    `, [placa.toUpperCase(), email]);

    if (ticket.length === 0) {
      return res.status(404).json({ error: 'No se encontró vehículo activo en el estacionamiento' });
    }

    const ticketData = ticket[0];
    const entrada = new Date(ticketData.fecha_hora_entrada);
    const salida = new Date();
    const tiempoEstadia = Math.ceil((salida - entrada) / (1000 * 60 * 60)); // horas
    const valorTotal = ticketData.valor * Math.max(1, tiempoEstadia);

    // Actualizar ticket
    await connection.query(
      'UPDATE Ticket SET fecha_hora_salida = NOW(), estado = "cerrado" WHERE id_ticket = ?',
      [ticketData.id_ticket]
    );

    // Liberar espacio
    await connection.query(
      'UPDATE Espacio SET estado = "disponible" WHERE id_espacio = ?',
      [ticketData.id_espacio]
    );

    // Registrar pago
    await connection.query(
      'INSERT INTO Pago (id_ticket, valor_pago, forma_pago, fecha_hora_pago) VALUES (?, ?, "efectivo", NOW())',
      [ticketData.id_ticket, valorTotal]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Salida registrada exitosamente',
      data: {
        placa: placa.toUpperCase(),
        tiempo_estadia: tiempoEstadia,
        valor_total: valorTotal,
        espacio: ticketData.numero_espacio  // ✅ CORREGIDO: Ahora devuelve el número formateado
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en salida:', error);
    res.status(500).json({ error: 'Error al registrar salida' });
  } finally {
    connection.release();
  }
});
app.get('/api/vehiculos-activos/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const [vehiculosActivos] = await pool.query(`
      SELECT 
        t.placa,
        t.fecha_hora_entrada,
        e.numero as numero_espacio,
        tv.nombre as tipo_vehiculo,
        CONCAT(
          TIMESTAMPDIFF(HOUR, t.fecha_hora_entrada, NOW()), 
          'h ', 
          TIMESTAMPDIFF(MINUTE, t.fecha_hora_entrada, NOW()) % 60, 
          'm'
        ) as tiempo_transcurrido
      FROM Ticket t
      JOIN Espacio e ON t.id_espacio = e.id_espacio
      JOIN Estacionamiento est ON e.id_estacionamiento = est.id_estacionamiento
      JOIN Vehiculo v ON t.placa = v.placa
      JOIN TipoVehiculo tv ON v.id_tipo_vehiculo = tv.id_tipo_vehiculo
      WHERE est.email = ? AND t.estado = 'activo'
      ORDER BY t.fecha_hora_entrada DESC
    `, [email]);

    res.json(vehiculosActivos);
  } catch (error) {
    console.error('Error obteniendo vehículos activos:', error);
    res.status(500).json({ error: 'Error al obtener vehículos activos' });
  }
});

// Endpoint de ocupacion del estacionamiento
app.get('/api/reporte-ocupacion/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Obtener información del estacionamiento
    const [estacionamiento] = await pool.query(
      'SELECT id_estacionamiento, nombre, capacidad FROM Estacionamiento WHERE email = ?',
      [email]
    );

    if (estacionamiento.length === 0) {
      return res.status(404).json({ error: 'Estacionamiento no encontrado' });
    }

    const { id_estacionamiento, nombre, capacidad } = estacionamiento[0];

    // Contar espacios por estado
    const [estadosEspacios] = await pool.query(`
      SELECT 
        estado,
        COUNT(*) as cantidad
      FROM Espacio 
      WHERE id_estacionamiento = ?
      GROUP BY estado
    `, [id_estacionamiento]);

    // Obtener vehículos activos por tipo
    const [vehiculosPorTipo] = await pool.query(`
      SELECT 
        tv.nombre as tipo_vehiculo,
        COUNT(*) as cantidad,
        AVG(TIMESTAMPDIFF(HOUR, t.fecha_hora_entrada, NOW())) as tiempo_promedio_horas
      FROM Ticket t
      JOIN Espacio e ON t.id_espacio = e.id_espacio
      JOIN Vehiculo v ON t.placa = v.placa
      JOIN TipoVehiculo tv ON v.id_tipo_vehiculo = tv.id_tipo_vehiculo
      WHERE e.id_estacionamiento = ? AND t.estado = 'activo'
      GROUP BY tv.nombre
      ORDER BY cantidad DESC
    `, [id_estacionamiento]);

    // Calcular estadísticas generales
    const espaciosOcupados = estadosEspacios.find(e => e.estado === 'ocupado')?.cantidad || 0;
    const espaciosDisponibles = estadosEspacios.find(e => e.estado === 'disponible')?.cantidad || 0;
    const porcentajeOcupacion = Math.round((espaciosOcupados / capacidad) * 100);

    // Obtener tiempo promedio general de estadía
    const [tiempoPromedio] = await pool.query(`
      SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, fecha_hora_entrada, NOW())) as promedio_minutos
      FROM Ticket t
      JOIN Espacio e ON t.id_espacio = e.id_espacio
      WHERE e.id_estacionamiento = ? AND t.estado = 'activo'
    `, [id_estacionamiento]);

    // Obtener ingresos del día
    const [ingresosDia] = await pool.query(`
      SELECT 
        COUNT(*) as ingresos_hoy,
        COUNT(CASE WHEN t.estado = 'activo' THEN 1 END) as vehiculos_activos
      FROM Ticket t
      JOIN Espacio e ON t.id_espacio = e.id_espacio
      WHERE e.id_estacionamiento = ? 
      AND DATE(t.fecha_hora_entrada) = CURDATE()
    `, [id_estacionamiento]);

    // Formatear tiempo promedio
    const promedioMinutos = tiempoPromedio[0]?.promedio_minutos || 0;
    const tiempoPromedioFormateado = {
      horas: Math.floor(promedioMinutos / 60),
      minutos: Math.round(promedioMinutos % 60)
    };

    // Formatear vehículos por tipo con tiempo promedio
    const vehiculosFormateados = vehiculosPorTipo.map(v => ({
      tipo: v.tipo_vehiculo,
      cantidad: v.cantidad,
      tiempo_promedio: {
        horas: Math.floor(v.tiempo_promedio_horas || 0),
        minutos: Math.round(((v.tiempo_promedio_horas || 0) % 1) * 60)
      }
    }));

    const reporte = {
      estacionamiento: {
        nombre,
        capacidad_total: capacidad
      },
      ocupacion: {
        espacios_ocupados: espaciosOcupados,
        espacios_disponibles: espaciosDisponibles,
        porcentaje_ocupacion: porcentajeOcupacion,
        estado: porcentajeOcupacion >= 90 ? 'lleno' : 
                porcentajeOcupacion >= 70 ? 'alto' :
                porcentajeOcupacion >= 40 ? 'medio' : 'bajo'
      },
      vehiculos_activos: {
        total: espaciosOcupados,
        por_tipo: vehiculosFormateados,
        tiempo_promedio_estadia: tiempoPromedioFormateado
      },
      actividad_dia: {
        ingresos_hoy: ingresosDia[0]?.ingresos_hoy || 0,
        vehiculos_activos: ingresosDia[0]?.vehiculos_activos || 0
      },
      ultima_actualizacion: new Date().toISOString()
    };

    res.json(reporte);

  } catch (error) {
    console.error('Error generando reporte de ocupación:', error);
    res.status(500).json({ 
      error: 'Error al generar reporte de ocupación',
      details: error.message 
    });
  }
});

app.get('/api/tarifas/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const [tarifas] = await pool.query(`
      SELECT 
        t.id_tarifa,
        t.valor,
        tv.id_tipo_vehiculo,
        tv.nombre as tipo_vehiculo
      FROM Tarifa t
      JOIN TipoVehiculo tv ON t.id_tipo_vehiculo = tv.id_tipo_vehiculo
      JOIN Estacionamiento e ON t.id_estacionamiento = e.id_estacionamiento
      WHERE e.email = ?
      ORDER BY tv.nombre
    `, [email]);

    res.json(tarifas);
  } catch (error) {
    console.error('Error obteniendo tarifas:', error);
    res.status(500).json({ error: 'Error al obtener tarifas' });
  }
});

// 2. Actualizar tarifa específica
app.put('/api/tarifas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;

    if (!valor || valor <= 0) {
      return res.status(400).json({ error: 'Valor debe ser mayor a 0' });
    }

    await pool.query(
      'UPDATE Tarifa SET valor = ? WHERE id_tarifa = ?',
      [valor, id]
    );

    res.json({ success: true, message: 'Tarifa actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando tarifa:', error);
    res.status(500).json({ error: 'Error al actualizar tarifa' });
  }
});

// 3. Obtener información completa del estacionamiento
app.get('/api/estacionamiento/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const [estacionamiento] = await pool.query(`
      SELECT 
        id_estacionamiento,
        nombre,
        direccion,
        ciudad,
        capacidad,
        email
      FROM Estacionamiento 
      WHERE email = ?
    `, [email]);

    if (estacionamiento.length === 0) {
      return res.status(404).json({ error: 'Estacionamiento no encontrado' });
    }

    // Obtener estadísticas adicionales
    const [estadisticas] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN estado = 'ocupado' THEN 1 END) as espacios_ocupados,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as espacios_disponibles
      FROM Espacio 
      WHERE id_estacionamiento = ?
    `, [estacionamiento[0].id_estacionamiento]);

    const resultado = {
      ...estacionamiento[0],
      estadisticas: estadisticas[0] || { espacios_ocupados: 0, espacios_disponibles: 0 }
    };

    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo estacionamiento:', error);
    res.status(500).json({ error: 'Error al obtener información del estacionamiento' });
  }
});

// 4. Actualizar información del estacionamiento
app.put('/api/estacionamiento/:email', async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const { email } = req.params;
    const { nombre, direccion, ciudad, capacidad } = req.body;

    // Validaciones
    if (!nombre || !direccion || !capacidad) {
      return res.status(400).json({ error: 'Nombre, dirección y capacidad son requeridos' });
    }

    const capacidadNum = parseInt(capacidad);
    if (isNaN(capacidadNum) || capacidadNum <= 0 || capacidadNum > 999) {
      return res.status(400).json({ error: 'Capacidad debe ser un número entre 1 y 999' });
    }

    // Obtener información actual
    const [estacionamientoActual] = await connection.query(
      'SELECT id_estacionamiento, capacidad FROM Estacionamiento WHERE email = ?',
      [email]
    );

    if (estacionamientoActual.length === 0) {
      return res.status(404).json({ error: 'Estacionamiento no encontrado' });
    }

    const { id_estacionamiento, capacidad: capacidadActual } = estacionamientoActual[0];

    // Actualizar información básica
    await connection.query(`
      UPDATE Estacionamiento 
      SET nombre = ?, direccion = ?, ciudad = ?, capacidad = ?
      WHERE email = ?
    `, [nombre.trim(), direccion.trim(), ciudad?.trim() || '', capacidadNum, email]);

    // Si cambió la capacidad, ajustar espacios
    if (capacidadNum !== capacidadActual) {
      if (capacidadNum > capacidadActual) {
        // Agregar espacios nuevos
        const espaciosNuevos = [];
        for (let i = capacidadActual + 1; i <= capacidadNum; i++) {
          espaciosNuevos.push([id_estacionamiento, i.toString().padStart(3, '0'), 'disponible']);
        }
        
        if (espaciosNuevos.length > 0) {
          await connection.query(
            'INSERT INTO Espacio (id_estacionamiento, numero, estado) VALUES ?',
            [espaciosNuevos]
          );
        }
      } else {
        // Verificar si hay espacios ocupados que se eliminarían
        const [espaciosOcupados] = await connection.query(`
          SELECT COUNT(*) as count 
          FROM Espacio 
          WHERE id_estacionamiento = ? AND estado = 'ocupado'
          AND CAST(numero AS UNSIGNED) > ?
        `, [id_estacionamiento, capacidadNum]);

        if (espaciosOcupados[0].count > 0) {
          await connection.rollback();
          return res.status(400).json({ 
            error: `No se puede reducir la capacidad. Hay ${espaciosOcupados[0].count} espacios ocupados que se eliminarían.` 
          });
        }

        // Eliminar espacios sobrantes
        await connection.query(`
          DELETE FROM Espacio 
          WHERE id_estacionamiento = ? AND CAST(numero AS UNSIGNED) > ?
        `, [id_estacionamiento, capacidadNum]);
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Información actualizada correctamente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error actualizando estacionamiento:', error);
    res.status(500).json({ error: 'Error al actualizar información del estacionamiento' });
  } finally {
    connection.release();
  }
});

// 5. Cambiar contraseña
app.put('/api/cambiar-password/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (password_nueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar contraseña actual
    const [usuario] = await pool.query(
      'SELECT id_estacionamiento FROM Estacionamiento WHERE email = ? AND password = ?',
      [email, password_actual]
    );

    if (usuario.length === 0) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    // Actualizar contraseña
    await pool.query(
      'UPDATE Estacionamiento SET password = ? WHERE email = ?',
      [password_nueva, email]
    );

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Ruta de imágenes: http://localhost:${PORT}/assets/vehiculos/`);
});