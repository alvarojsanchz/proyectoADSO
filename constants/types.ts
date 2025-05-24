// constants/types.ts

export type TiempoPromedio = {
    horas: number;
    minutos: number;
  };
  
  export type VehiculoPorTipo = {
    tipo: string;
    cantidad: number;
    tiempo_promedio: TiempoPromedio;
  };
  
  export type EstadoOcupacion = 'bajo' | 'medio' | 'alto' | 'lleno';
  
  export type ReporteOcupacion = {
    estacionamiento: {
      nombre: string;
      capacidad_total: number;
    };
    ocupacion: {
      espacios_ocupados: number;
      espacios_disponibles: number;
      porcentaje_ocupacion: number;
      estado: EstadoOcupacion;
    };
    vehiculos_activos: {
      total: number;
      por_tipo: VehiculoPorTipo[];
      tiempo_promedio_estadia: TiempoPromedio;
    };
    actividad_dia: {
      ingresos_hoy: number;
      vehiculos_activos: number;
    };
    ultima_actualizacion: string;
  };

  export type Tarifa = {
    id_tarifa: number;
    valor: number;
    id_tipo_vehiculo: number;
    tipo_vehiculo: string;
  };
  
  export type EstacionamientoInfo = {
    id_estacionamiento: number;
    nombre: string;
    direccion: string;
    ciudad: string;
    capacidad: number;
    email: string;
    estadisticas: {
      espacios_ocupados: number;
      espacios_disponibles: number;
    };
  };
  
  export type ActualizarEstacionamiento = {
    nombre: string;
    direccion: string;
    ciudad: string;
    capacidad: string;
  };
  
  export type CambiarPassword = {
    password_actual: string;
    password_nueva: string;
  };