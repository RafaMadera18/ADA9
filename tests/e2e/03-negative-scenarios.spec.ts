import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api-helper';

/**
 * ESCENARIO 3: Casos Negativos y Manejo de Errores
 * 
 * Pruebas para:
 * - Credenciales inválidas
 * - Datos faltantes
 * - Falta de autenticación
 * - Recursos inexistentes
 * - Datos inválidos
 */

test.describe('Escenario 3: Casos Negativos y Manejo de Errores', () => {
  let api: ApiHelper;
  let unauthApi: ApiHelper;
  let authContext: any;
  let unauthContext: any;

  test.beforeAll(async ({ playwright }) => {

    authContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
    });

    api = new ApiHelper(authContext);

    await api.login(
      process.env.TEST_USERNAME || 'testuser',
      process.env.TEST_PASSWORD || 'Test123!'
    );

    unauthContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
    });

    unauthApi = new ApiHelper(unauthContext);
  });

  test.afterAll(async () => {
    await authContext.dispose();
    await unauthContext.dispose();
  });

  test('TC025 - Login con credenciales incorrectas', async () => {
    const startTime = Date.now();

    const response = await unauthApi.login('usuarioInexistente', 'ClaveMala');

    await api.logRequestResponse('TC025', response);

    expect(response.ok()).toBeFalsy();
    expect([400, 401]).toContain(response.status());

    console.log(`✓ Login rechazado (Status: ${response.status()})`);

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC026 - Login con datos incompletos', async () => {
    const startTime = Date.now();

    const response = await unauthContext.post('/api/account/login', {
      data: { userName: 'testuser' } // Falta password
    });

    await api.logRequestResponse('TC026', response);

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('errors');

    console.log('✓ Validación de campos requeridos OK');

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC027 - Crear huésped sin autenticación', async () => {
    const startTime = Date.now();

    const response = await unauthApi.createGuest(
      'Test Guest',
      '+52-999-000-0000',
      '1990-01-01'
    );

    await api.logRequestResponse('TC027', response);

    expect(response.ok()).toBeFalsy();
    expect([401, 403]).toContain(response.status());

    console.log(`✓ Endpoint protegido correctamente`);

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC028 - Actualizar huésped inexistente', async () => {
    const startTime = Date.now();

    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await api.updateGuest(fakeId, {
      fullName: 'Updated Name'
    });

    await api.logRequestResponse('TC028', response);

    expect(response.status()).toBe(404);

    console.log('✓ Recurso inexistente manejado correctamente');

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC029 - Eliminar habitación inexistente', async () => {
    const startTime = Date.now();

    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await api.deleteRoom(fakeId);

    await api.logRequestResponse('TC029', response);

    expect(response.status()).toBe(404);

    console.log('✓ Recurso inexistente en DELETE manejado correctamente');

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC030 - Crear huésped con fecha futura', async () => {
    const startTime = Date.now();

    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);

    const response = await api.createGuest(
      'Test Guest',
      '+52-999-000-0000',
      future.toISOString().split('T')[0]
    );

    await api.logRequestResponse('TC030', response);

    if (response.ok()) {
      console.log(`⚠ El servidor aceptó una fecha futura`);
    } else {
      console.log(`✓ Fecha inválida rechazada correctamente`);
    }

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC031 - Crear reservación con fechas inválidas', async () => {
    const startTime = Date.now();

    const g = await api.createGuest('Test', '+52-999-000-0000', '1990-01-01');
    const guestId = await g.json();

    const r = await api.createRoom('Test Room');
    const roomId = await r.json();

    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);

    const response = await api.createReservation({
      guestId,
      roomId,
      checkInDate: today.toISOString(),
      checkOutDate: yesterday.toISOString(),
      price: 100
    });

    await api.logRequestResponse('TC031', response);

    if (response.ok()) {
      console.log(`⚠ El servidor aceptó fechas inválidas`);
    } else {
      console.log(`✓ Fechas inválidas rechazadas correctamente`);
    }

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC032 - Crear producto con cantidad negativa', async () => {
    const startTime = Date.now();

    const response = await api.createProductStock('Test Product', -5, 50);

    await api.logRequestResponse('TC032', response);

    expect(response.ok()).toBeFalsy();
    expect([400, 422]).toContain(response.status());

    console.log(`✓ Cantidad negativa rechazada correctamente`);
    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });


  test('TC033 - Obtener info de usuario sin autenticación', async () => {
    const startTime = Date.now();

    const response = await unauthApi.getUserInfo();

    await api.logRequestResponse('TC033', response);

    expect(response.ok()).toBeFalsy();
    expect([401, 403]).toContain(response.status());

    console.log(`✓ Información protegida correctamente`);

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC034 - Checkout de reservación inexistente', async () => {
    const startTime = Date.now();

    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await api.checkout(fakeId);

    await api.logRequestResponse('TC034', response);

    expect(response.status()).toBe(404);

    console.log(`✓ Reservación inexistente manejada correctamente`);

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });

  test('TC035 - Crear reporte de compra con producto inexistente', async () => {
    const startTime = Date.now();

    const fakeProductId = '00000000-0000-0000-0000-000000000000';

    const response = await api.createPurchaseReport({
      stockAdjustmentData: [{ productId: fakeProductId, quantity: 10 }],
      price: 100
    });

    await api.logRequestResponse('TC035', response);

    if (response.ok()) {
      console.log(`⚠ Servidor aceptó producto inexistente`);
    } else {
      console.log(`✓ Producto inexistente rechazado`);
    }

    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
  });


  test('TC036 - Eliminar grupo de propiedades con habitaciones asociadas', async () => {
    const startTime = Date.now();
    const group = await api.createRoomPropertyGroup('Test Group');
    const groupId = await group.json();
    
    const update = await api.updateRoomPropertyGroup(groupId, {
      name: 'Test Group',
      properties: [{ name: 'Prop A' }]
    });

    const props = await update.json();
    const propertyId = Object.values(props)[0];

    const room = await api.createRoom('Test Room');
    const roomId = await room.json();

    await api.updateRoom(roomId, {
      name: 'Test Room',
      propertiesIds: [propertyId]
    });

    const response = await api.deleteRoomPropertyGroup(groupId);

    await api.logRequestResponse('TC036', response);

    expect(response.ok()).toBeFalsy();
    expect([400, 409, 422]).toContain(response.status());

    console.log(`✓ No permite eliminar grupo con dependencias`);
    console.log(`Tiempo de respuesta: ${Date.now() - startTime}ms`);
});

});
