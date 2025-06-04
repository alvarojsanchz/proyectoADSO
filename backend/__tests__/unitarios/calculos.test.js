//backend/__tests__/unitarios/calculos.test.js
/* global describe, test, expect */

describe('Pruebas Unitarias - Cálculos', () => {
  
    // CP_RF03_001: Cálculo de tarifa hora completa
    test('CP_RF03_001: Calcular tarifa hora completa', () => {
      const calcularTarifa = (valorPorHora, horas) => {
        if (valorPorHora <= 0 || horas <= 0) return 0;
        return valorPorHora * Math.max(1, Math.ceil(horas));
      };
      
      expect(calcularTarifa(3000, 1)).toBe(3000);
    });
  
    // CP_RF03_002: Redondeo hacia arriba
    test('CP_RF03_002: Redondeo fracción de hora', () => {
      const calcularTarifa = (valorPorHora, horas) => {
        if (valorPorHora <= 0 || horas <= 0) return 0;
        return valorPorHora * Math.max(1, Math.ceil(horas));
      };
      
      expect(calcularTarifa(3000, 1.5)).toBe(6000);
    });
  
    // CP_RF03_003: Validación valores negativos
    test('CP_RF03_003: Rechazar valores negativos', () => {
      const calcularTarifa = (valorPorHora, horas) => {
        if (valorPorHora <= 0 || horas <= 0) return 0;
        return valorPorHora * Math.max(1, Math.ceil(horas));
      };
      
      expect(calcularTarifa(-100, 2)).toBe(0);
    });
  
    // CP_RF05_001: Cálculo porcentaje de ocupación
    test('CP_RF05_001: Calcular porcentaje de ocupación', () => {
      const calcularPorcentaje = (ocupados, total) => {
        if (total <= 0) return 0;
        return Math.round((ocupados / total) * 100);
      };
      
      expect(calcularPorcentaje(25, 50)).toBe(50);
    });
  
    // CP_RF05_002: Estado ocupación alta
    test('CP_RF05_002: Clasificar estado ocupación alta', () => {
      const calcularEstado = (ocupados, total) => {
        const porcentaje = (ocupados / total) * 100;
        if (porcentaje >= 90) return 'lleno';
        if (porcentaje >= 70) return 'alto';
        if (porcentaje >= 40) return 'medio';
        return 'bajo';
      };
      
      expect(calcularEstado(45, 50)).toBe('lleno');
    });
  });