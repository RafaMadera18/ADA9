import { FullConfig } from '@playwright/test';

/**
 * Global teardown que se ejecuta UNA VEZ después de todas las pruebas
 * Útil para:
 * - Limpiar datos de prueba
 * - Cerrar conexiones
 * - Generar reportes finales
 * - Notificaciones
 */

async function globalTeardown(config: FullConfig) {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  🧹 LIMPIEZA GLOBAL DESPUÉS DE PRUEBAS            ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  console.log(`⏰ Finalizado: ${new Date().toLocaleString('es-MX')}`);
  console.log(`📊 Reportes disponibles en: ./playwright-report\n`);

  console.log('💡 Comandos útiles:');
  console.log('   npm run report       - Ver reporte HTML');
  console.log('   npm run report:json  - Generar resumen markdown\n');

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  ✅ LIMPIEZA COMPLETADA                           ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
}

export default globalTeardown;