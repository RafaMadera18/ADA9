import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api-helper';

/**
 * ESCENARIO 1: Flujo Completo de Reservación
 * 
 * Este escenario prueba el flujo de negocio principal del sistema:
 * desde la autenticación hasta el checkout de una reservación.
 */

test.describe('Escenario 1: Flujo Completo de Reservación', () => {
  let api: ApiHelper;
  let authContext: any;
  
  let propertyGroupId: string;
  let propertyId: string;
  let roomId: string;
  let guestId: string;
  let reservationId: string;

  test.beforeAll(async ({ playwright }) => {
    authContext = await playwright.request.newContext({
      baseURL: process.env.API_BASE_URL || 'http://localhost:5000',
    });
    api = new ApiHelper(authContext);
  });

  test.afterAll(async () => {
    await authContext.dispose();
  });

  test('TC001 - Verificar estado de registro de administrador', async () => {
    const startTime = Date.now();
    
    const response = await api.checkAdminRegistrationStatus();
    
    await api.logRequestResponse('TC001', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const canRegister = await response.json();
    console.log(`✓ Puede registrar admin: ${canRegister}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC002 - Registrar usuario administrador', async () => {
    const startTime = Date.now();
    
    const username = process.env.TEST_USERNAME || "testuser";
    const password = process.env.TEST_PASSWORD || "Test123!";
    const adminCode = process.env.ADMIN_CODE || 'admin-secret-code';
    
    const response = await api.registerAdmin(username, password, adminCode);
    
    await api.logRequestResponse('TC002', response);
    
    if (response.status() === 200) {
      console.log(`✓ Administrador creado: ${username}`);
    } else if (response.status() === 400) {
      console.log(`⚠ Ya existe un administrador`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC003 - Iniciar sesión exitosa', async () => {
    const startTime = Date.now();
    
    // Usar credenciales conocidas o crear nuevo usuario
    const username = process.env.TEST_USERNAME || 'testuser';
    const password = process.env.TEST_PASSWORD || 'Test123!';
    
    const response = await api.login(username, password);
    
    await api.logRequestResponse('TC003', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    console.log(`✓ Sesión iniciada para: ${username}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC004 - Obtener información del usuario', async () => {
    const response = await api.getUserInfo();
    
    await api.logRequestResponse('TC004', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const userInfo = await response.json();
    expect(userInfo).toHaveProperty('userName');
    console.log(`✓ Usuario autenticado: ${userInfo.userName}`);
  });

  test('TC005 - Crear grupo de propiedades de habitación', async () => {
    const startTime = Date.now();
    
    const response = await api.createRoomPropertyGroup('Tipo de Cama');
    
    await api.logRequestResponse('TC005', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    propertyGroupId = await api.extractIdFromResponse(response);
    expect(propertyGroupId).toBeTruthy();
    
    console.log(`✓ Grupo de propiedades creado: ${propertyGroupId}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC006 - Agregar propiedades al grupo', async () => {
    const startTime = Date.now();
    
    const updateData = {
      name: 'Tipo de Cama',
      properties: [
        { name: 'Cama Individual' },
        { name: 'Cama Doble' },
        { name: 'Cama King Size' }
      ]
    };
    
    const response = await api.updateRoomPropertyGroup(propertyGroupId, updateData);
    
    await api.logRequestResponse('TC006', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const propertyIds = await response.json();
    const ids = Object.values(propertyIds);
    propertyId = ids[0] as string;
    
    console.log(`✓ Propiedades agregadas: ${ids.length}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC007 - Crear habitación', async () => {
    const startTime = Date.now();
    
    const roomName = `Habitación ${Date.now()}`;
    const response = await api.createRoom(roomName);
    
    await api.logRequestResponse('TC007', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    roomId = await api.extractIdFromResponse(response);
    expect(roomId).toBeTruthy();
    
    console.log(`✓ Habitación creada: ${roomName} (${roomId})`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC008 - Asignar propiedades a habitación', async () => {
    const response = await api.updateRoom(roomId, {
      name: 'Habitación Suite',
      propertiesIds: [propertyId]
    });
    
    await api.logRequestResponse('TC008', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(204);
    
    console.log(`✓ Propiedades asignadas a habitación`);
  });

  test('TC009 - Crear huésped', async () => {
    const startTime = Date.now();
    
    const guestData = {
      fullName: 'Juan Pérez García',
      phoneNumber: '52-999-123-4567',
      dateOfBirth: '1990-05-15'
    };
    
    const response = await api.createGuest(
      guestData.fullName,
      guestData.phoneNumber,
      guestData.dateOfBirth
    );
    
    await api.logRequestResponse('TC009', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    guestId = await api.extractIdFromResponse(response);
    expect(guestId).toBeTruthy();
    
    console.log(`✓ Huésped creado: ${guestData.fullName} (${guestId})`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC010 - Verificar disponibilidad de habitaciones', async () => {
    const startTime = Date.now();
    
    const response = await api.getRoomAvailability();
    
    await api.logRequestResponse('TC010', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const availability = await response.json();
    expect(Array.isArray(availability)).toBeTruthy();
    
    const ourRoom = availability.find((r: any) => r.room.id === roomId);
    expect(ourRoom).toBeTruthy();
    
    // State: 0=Available, 1=Occupied, 2=Reserved, 3=Maintenance
    console.log(`✓ Estado de habitación: ${ourRoom.state}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC011 - Crear reservación', async () => {
    const startTime = Date.now();
    
    const now = new Date();
    const checkIn = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Mañana
    const checkOut = new Date(checkIn.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 días después
    
    const reservationData = {
      guestId: guestId,
      roomId: roomId,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      price: 1500
    };
    
    const response = await api.createReservation(reservationData);
    
    await api.logRequestResponse('TC011', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    reservationId = await api.extractIdFromResponse(response);
    expect(reservationId).toBeTruthy();
    
    console.log(`✓ Reservación creada: ${reservationId}`);
    console.log(`  Check-in: ${checkIn.toLocaleDateString()}`);
    console.log(`  Check-out: ${checkOut.toLocaleDateString()}`);
    console.log(`  Precio: $${reservationData.price}`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC012 - Realizar checkout', async () => {
    const startTime = Date.now();
    
    const response = await api.checkout(reservationId);
    
    await api.logRequestResponse('TC012', response);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    console.log(`✓ Checkout realizado exitosamente`);
    
    const duration = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${duration}ms`);
  });

  test('TC013 - Verificar estado final de habitación', async () => {
    const response = await api.getRoomAvailability();
    
    expect(response.ok()).toBeTruthy();
    
    const availability = await response.json();
    const ourRoom = availability.find((r: any) => r.room.id === roomId);
    
    console.log(`✓ Estado final de habitación: ${ourRoom.state}`);
    console.log(`✓ Checkout realizado: ${ourRoom.activeReservation?.checkOutDone || false}`);
  });
});