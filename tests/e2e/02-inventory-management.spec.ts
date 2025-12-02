import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api-helper';

/**
 * ESCENARIO 2: Gestión de Inventario
 * 
 * Prueba el ciclo completo de manejo de inventario:
 * - Creación de productos
 * - Registro de compras
 * - Registro de consumos
 * - Verificación de stock
 */

test.describe('Escenario 2: Gestión de Inventario', () => {
  let api: ApiHelper;
  let authContext: any;
  
  let productStock1Id: string;
  let product1Id: string;
  let productStock2Id: string;
  let product2Id: string;
  let purchaseReportId: string;
  let usageReportId: string;

  test.beforeAll(async ({ playwright }) => {
    authContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
    });
    api = new ApiHelper(authContext);
    
    // Autenticar antes de las pruebas
    await api.login(
      process.env.TEST_USERNAME || 'testuser',
      process.env.TEST_PASSWORD || 'Test123!'
    );
  });

  test.afterAll(async () => {
    await authContext.dispose();
  });

  test('TC014 - Crear producto 1 en inventario (Toallas)', async () => {
    const startTime = Date.now();
    
    const response = await api.createProductStock('Toallas de Baño', 50, 100);
    
    await api.logRequestResponse('TC014', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    productStock1Id = result.stockId;
    product1Id = result.productId;
    
    expect(productStock1Id).toBeTruthy();
    expect(product1Id).toBeTruthy();
    
    console.log(`✓ Producto creado: Toallas de Baño`);
    console.log(`  Stock ID: ${productStock1Id}`);
    console.log(`  Product ID: ${product1Id}`);
    console.log(`  Cantidad actual: 50`);
    console.log(`  Cantidad ideal: 100`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC015 - Crear producto 2 en inventario (Jabón)', async () => {
    const startTime = Date.now();
    
    const response = await api.createProductStock('Jabón Líquido', 30, 80);
    
    await api.logRequestResponse('TC015', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    productStock2Id = result.stockId;
    product2Id = result.productId;
    
    console.log(`✓ Producto creado: Jabón Líquido`);
    console.log(`  Stock ID: ${productStock2Id}`);
    console.log(`  Product ID: ${product2Id}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC016 - Listar inventario completo', async () => {
    const startTime = Date.now();
    
    const response = await api.getInventory();
    
    await api.logRequestResponse('TC016', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const inventory = await response.json();
    expect(Array.isArray(inventory)).toBeTruthy();
    expect(inventory.length).toBeGreaterThanOrEqual(2);
    
    console.log(`✓ Productos en inventario: ${inventory.length}`);
    
    for (const item of inventory) {
      console.log(`  - ${item.product.name}: ${item.stockQuantity}/${item.idealQuantity}`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC017 - Registrar compra de productos', async () => {
    const startTime = Date.now();
    
    const purchaseData = {
      stockAdjustmentData: [
        { productId: product1Id, quantity: 50 }, // +50 toallas
        { productId: product2Id, quantity: 30 }  // +30 jabones
      ],
      price: 1250.5
    };
    
    const response = await api.createPurchaseReport(purchaseData);
    
    await api.logRequestResponse('TC017', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    purchaseReportId = await api.extractIdFromResponse(response);
    expect(purchaseReportId).toBeTruthy();
    
    console.log(`✓ Compra registrada: ${purchaseReportId}`);
    console.log(`  + 50 Toallas de Baño`);
    console.log(`  + 30 Jabón Líquido`);
    console.log(`  Costo total: $${purchaseData.price}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC018 - Verificar actualización de stock después de compra', async () => {
    const response = await api.getInventory();
    
    expect(response.ok()).toBeTruthy();
    
    const inventory = await response.json();
    
    const toallas = inventory.find((i: any) => i.product.id === product1Id);
    const jabon = inventory.find((i: any) => i.product.id === product2Id);
    
    expect(toallas.stockQuantity).toBe(100); // 50 + 50
    expect(jabon.stockQuantity).toBe(60);    // 30 + 30
    
    console.log(`✓ Stock actualizado correctamente:`);
    console.log(`  Toallas: ${toallas.stockQuantity} (esperado: 100)`);
    console.log(`  Jabón: ${jabon.stockQuantity} (esperado: 60)`);
  });

  test('TC019 - Registrar uso/consumo de productos', async () => {
    const startTime = Date.now();
    
    const usageData = {
      stockAdjustmentData: [
        { productId: product1Id, quantity: 20 }, // -20 toallas usadas
        { productId: product2Id, quantity: 15 }  // -15 jabones usados
      ],
      concept: 'Consumo diario habitaciones 101-110'
    };
    
    const response = await api.createUsageReport(usageData);
    
    await api.logRequestResponse('TC019', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    usageReportId = await api.extractIdFromResponse(response);
    expect(usageReportId).toBeTruthy();
    
    console.log(`✓ Uso registrado: ${usageReportId}`);
    console.log(`  - 20 Toallas de Baño`);
    console.log(`  - 15 Jabón Líquido`);
    console.log(`  Concepto: ${usageData.concept}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC020 - Verificar stock final después de consumo', async () => {
    const response = await api.getInventory();
    
    expect(response.ok()).toBeTruthy();
    
    const inventory = await response.json();
    
    const toallas = inventory.find((i: any) => i.product.id === product1Id);
    const jabon = inventory.find((i: any) => i.product.id === product2Id);
    
    expect(toallas.stockQuantity).toBe(80);  // 100 - 20
    expect(jabon.stockQuantity).toBe(45);    // 60 - 15
    
    console.log(`✓ Stock final verificado:`);
    console.log(`  Toallas: ${toallas.stockQuantity} (esperado: 80)`);
    console.log(`  Jabón: ${jabon.stockQuantity} (esperado: 45)`);
    
    // Verificar si necesita reabastecimiento
    if (toallas.stockQuantity < toallas.idealQuantity) {
      const needed = toallas.idealQuantity - toallas.stockQuantity;
      console.log(`  ⚠ Toallas necesita reabastecimiento: ${needed} unidades`);
    }
    
    if (jabon.stockQuantity < jabon.idealQuantity) {
      const needed = jabon.idealQuantity - jabon.stockQuantity;
      console.log(`  ⚠ Jabón necesita reabastecimiento: ${needed} unidades`);
    }
  });

  test('TC021 - Listar reportes de compras', async () => {
    const response = await api.getPurchaseReports();
    
    await api.logRequestResponse('TC021', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const reports = await response.json();
    expect(Array.isArray(reports)).toBeTruthy();
    expect(reports.length).toBeGreaterThanOrEqual(1);
    
    console.log(`✓ Reportes de compra encontrados: ${reports.length}`);
    
    const ourReport = reports.find((r: any) => r.id === purchaseReportId);
    expect(ourReport).toBeTruthy();
    
    console.log(`  Fecha: ${new Date(ourReport.registrationDate).toLocaleString()}`);
    console.log(`  Precio: $${ourReport.price}`);
    console.log(`  Ajustes: ${ourReport.stockAdjustments.length} productos`);
  });

  test('TC022 - Listar reportes de uso', async () => {
    const response = await api.getUsageReports();
    
    await api.logRequestResponse('TC022', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const reports = await response.json();
    expect(Array.isArray(reports)).toBeTruthy();
    expect(reports.length).toBeGreaterThanOrEqual(1);
    
    console.log(`✓ Reportes de uso encontrados: ${reports.length}`);
    
    const ourReport = reports.find((r: any) => r.id === usageReportId);
    expect(ourReport).toBeTruthy();
    
    console.log(`  Fecha: ${new Date(ourReport.registrationDate).toLocaleString()}`);
    console.log(`  Concepto: ${ourReport.concept}`);
    console.log(`  Ajustes: ${ourReport.stockAdjustments.length} productos`);
  });

  test('TC023 - Actualizar información de producto', async () => {
    const startTime = Date.now();
    
    const updateData = {
      name: 'Toallas de Baño Premium',
      idealQuantity: 120
    };
    
    const response = await api.updateProductStock(productStock1Id, updateData);
    
    await api.logRequestResponse('TC023', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(204);
    
    console.log(`✓ Producto actualizado exitosamente`);
    console.log(`  Nuevo nombre: ${updateData.name}`);
    console.log(`  Nueva cantidad ideal: ${updateData.idealQuantity}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC024 - Verificar cambios en el producto', async () => {
    const response = await api.getInventory();
    
    expect(response.ok()).toBeTruthy();
    
    const inventory = await response.json();
    const toallas = inventory.find((i: any) => i.id === productStock1Id);
    
    expect(toallas.product.name).toBe('Toallas de Baño Premium');
    expect(toallas.idealQuantity).toBe(120);
    
    console.log(`✓ Cambios verificados:`);
    console.log(`  Nombre: ${toallas.product.name}`);
    console.log(`  Cantidad ideal: ${toallas.idealQuantity}`);
  });
});