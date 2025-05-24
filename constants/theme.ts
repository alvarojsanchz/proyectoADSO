// constants/theme.ts

export const COLORS = {
    // Azules principales
    primary: "#2563EB",        // Azul principal elegante
    primaryLight: "#3B82F6",   // Azul más claro para acentos
    primaryDark: "#1E40AF",    // Azul oscuro para contraste
    
    // Fondos
    background: "#F8FAFC",     // Azul muy claro, casi blanco
    surface: "#FFFFFF",        // Blanco puro para tarjetas
    surfaceLight: "#F1F5F9",   // Gris azulado muy claro
    surfaceDark: "#E2E8F0",    // Gris azulado para bordes
    
    // Textos
    textPrimary: "#0F172A",    // Texto principal oscuro
    textSecondary: "#475569",  // Texto secundario gris
    textMuted: "#64748B",      // Texto desactivado
    
    // Estados
    success: "#059669",        // Verde sobrio para éxito
    warning: "#D97706",        // Naranja sobrio para advertencias
    error: "#DC2626",          // Rojo sobrio para errores
    info: "#0284C7",           // Azul info
    
    // Compatibilidad (para componentes existentes)
    white: "#FFFFFF",
    grey: "#64748B",
    
    // Gradientes y acentos
    accent: "#6366F1",         // Púrpura suave para acentos
    accentLight: "#A5B4FC",    // Púrpura claro
    
    // Bordes y divisores
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
  } as const;