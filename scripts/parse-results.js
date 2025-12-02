const fs = require('fs');
const path = require('path');

/**
 * Script para parsear y generar reporte detallado de resultados
 */

const resultsPath = path.join(__dirname, '../test-results/results.json');
const outputPath = path.join(__dirname, '../test-results/summary.md');

if (!fs.existsSync(resultsPath)) {
  console.error('❌ No se encontró el archivo de resultados');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Calcular estadísticas
const totalTests = results.suites.reduce((acc, suite) => {
  return acc + suite.specs.reduce((sum, spec) => sum + spec.tests.length, 0);
}, 0);

let passed = 0;
let failed = 0;
let skipped = 0;
let totalDuration = 0;

const testDetails = [];

results.suites.forEach(suite => {
  suite.specs.forEach(spec => {
    spec.tests.forEach(test => {
      const result = test.results[0];
      totalDuration += result.duration;
      
      if (result.status === 'passed') passed++;
      else if (result.status === 'failed') failed++;
      else if (result.status === 'skipped') skipped++;
      
      testDetails.push({
        suite: suite.title,
        test: spec.title,
        status: result.status,
        duration: result.duration,
        error: result.error?.message || null
      });
    });
  });
});

// Generar reporte en Markdown
let report = `# 📊 Reporte de Pruebas Automatizadas - MrHotel API

## Resumen Ejecutivo

**Fecha de ejecución:** ${new Date().toLocaleString('es-MX')}

| Métrica | Valor |
|---------|-------|
| **Total de pruebas** | ${totalTests} |
| ✅ **Pasadas** | ${passed} (${((passed/totalTests)*100).toFixed(1)}%) |
| ❌ **Fallidas** | ${failed} (${((failed/totalTests)*100).toFixed(1)}%) |
| ⏭️ **Omitidas** | ${skipped} (${((skipped/totalTests)*100).toFixed(1)}%) |
| ⏱️ **Tiempo total** | ${(totalDuration/1000).toFixed(2)}s |
| ⚡ **Tiempo promedio** | ${(totalDuration/totalTests).toFixed(0)}ms |

---

## 📈 Resultados por Escenario

`;

// Agrupar por suite
const suiteGroups = {};
testDetails.forEach(test => {
  if (!suiteGroups[test.suite]) {
    suiteGroups[test.suite] = [];
  }
  suiteGroups[test.suite].push(test);
});

Object.entries(suiteGroups).forEach(([suite, tests]) => {
  const suitePassed = tests.filter(t => t.status === 'passed').length;
  const suiteFailed = tests.filter(t => t.status === 'failed').length;
  const suiteTotal = tests.length;
  
  report += `### ${suite}\n\n`;
  report += `**Resultado:** ${suitePassed}/${suiteTotal} pasadas\n\n`;
  
  report += `| # | Caso de Prueba | Estado | Tiempo |\n`;
  report += `|---|---------------|--------|--------|\n`;
  
  tests.forEach((test, index) => {
    const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
    report += `| ${index + 1} | ${test.test} | ${icon} ${test.status} | ${test.duration}ms |\n`;
  });
  
  report += '\n';
  
  // Mostrar errores si los hay
  const errors = tests.filter(t => t.error);
  if (errors.length > 0) {
    report += `#### ❌ Errores encontrados:\n\n`;
    errors.forEach(test => {
      report += `**${test.test}**\n\`\`\`\n${test.error}\n\`\`\`\n\n`;
    });
  }
});

// Análisis de performance
report += `---

## ⚡ Análisis de Performance

### Pruebas más lentas:

`;

const slowestTests = [...testDetails]
  .sort((a, b) => b.duration - a.duration)
  .slice(0, 5);

slowestTests.forEach((test, index) => {
  report += `${index + 1}. **${test.test}** - ${test.duration}ms\n`;
});

report += `\n### Pruebas más rápidas:

`;

const fastestTests = [...testDetails]
  .filter(t => t.status === 'passed')
  .sort((a, b) => a.duration - b.duration)
  .slice(0, 5);

fastestTests.forEach((test, index) => {
  report += `${index + 1}. **${test.test}** - ${test.duration}ms\n`;
});

// Recomendaciones
report += `\n---

## 💡 Recomendaciones

`;

if (failed > 0) {
  report += `- ⚠️ Se detectaron **${failed} pruebas fallidas**. Revisar logs detallados.\n`;
}

const avgDuration = totalDuration / totalTests;
if (avgDuration > 2000) {
  report += `- ⚠️ Tiempo promedio alto (${avgDuration.toFixed(0)}ms). Considerar optimización.\n`;
}

const successRate = (passed / totalTests) * 100;
if (successRate < 95) {
  report += `- ⚠️ Tasa de éxito baja (${successRate.toFixed(1)}%). Objetivo: >95%\n`;
} else {
  report += `- ✅ Excelente tasa de éxito (${successRate.toFixed(1)}%)\n`;
}

if (totalDuration > 120000) {
  report += `- ⚠️ Suite de pruebas tarda más de 2 minutos. Considerar paralelización.\n`;
} else {
  report += `- ✅ Tiempo de ejecución dentro del objetivo (<2 min)\n`;
}

// Guardar reporte
fs.writeFileSync(outputPath, report);

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE PRUEBAS');
console.log('='.repeat(60));
console.log(`Total:    ${totalTests}`);
console.log(`✅ Pasadas:  ${passed} (${((passed/totalTests)*100).toFixed(1)}%)`);
console.log(`❌ Fallidas: ${failed} (${((failed/totalTests)*100).toFixed(1)}%)`);
console.log(`⏱️  Tiempo:   ${(totalDuration/1000).toFixed(2)}s`);
console.log('='.repeat(60));
console.log(`\n📄 Reporte detallado guardado en: ${outputPath}\n`);

// Exit code basado en resultados
process.exit(failed > 0 ? 1 : 0);