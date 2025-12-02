import { APIRequestContext, expect } from '@playwright/test';

export class ApiHelper {
  constructor(private readonly request: APIRequestContext) {}

  // Métodos de autenticación
  async registerAdmin(username: string, password: string, adminCode: string) {
    const response = await this.request.post('/api/account/register-admin', {
      data: {
        userName: username,
        password: password,
        adminCode: adminCode
      }
    });
    return response;
  }

  async login(username: string, password: string) {
    const response = await this.request.post('/api/account/login', {
      data: {
        userName: username,
        password: password
      }
    });
    return response;
  }

  async logout() {
    return await this.request.post('/api/account/logout');
  }

  async getUserInfo() {
    return await this.request.get('/api/account/manage/info');
  }

  async checkAdminRegistrationStatus() {
    return await this.request.get('/api/account/admin-register-status');
  }

  // Métodos de Huéspedes
  async createGuest(fullName: string, phoneNumber: string, dateOfBirth: string) {
    const response = await this.request.post('/api/guests', {
      data: {
        fullName,
        phoneNumber,
        dateOfBirth
      }
    });
    return response;
  }

  async getGuests() {
    return await this.request.get('/api/guests');
  }

  async updateGuest(guestId: string, data: any) {
    return await this.request.put(`/api/guests/${guestId}`, { data });
  }

  async deleteGuest(guestId: string) {
    return await this.request.delete(`/api/guests/${guestId}`);
  }

  // Métodos de Grupos de Propiedades
  async createRoomPropertyGroup(name: string) {
    const response = await this.request.post('/api/room-property-groups', {
      data: { name }
    });
    return response;
  }

  async getRoomPropertyGroups() {
    return await this.request.get('/api/room-property-groups');
  }

  async updateRoomPropertyGroup(groupId: string, data: any) {
    return await this.request.put(`/api/room-property-groups/${groupId}`, { data });
  }

  async deleteRoomPropertyGroup(groupId: string) {
    return await this.request.delete(`/api/room-property-groups/${groupId}`);
  }

  // Métodos de Habitaciones
  async createRoom(name: string) {
    const response = await this.request.post('/api/rooms', {
      data: { name }
    });
    return response;
  }

  async updateRoom(roomId: string, data: any) {
    return await this.request.put(`/api/rooms/${roomId}`, { data });
  }

  async deleteRoom(roomId: string) {
    return await this.request.delete(`/api/rooms/${roomId}`);
  }

  async getRoomAvailability() {
    return await this.request.get('/api/rooms/availability');
  }

  // Métodos de Reservaciones
  async createReservation(data: {
    guestId: string,
    roomId: string,
    checkInDate: string,
    checkOutDate: string,
    price: number
  }) {
    const response = await this.request.post('/api/reservations', { data });
    return response;
  }

  async checkout(reservationId: string) {
    return await this.request.put(`/api/reservations/${reservationId}/checkout`);
  }

  // Métodos de Inventario
  async createProductStock(productName: string, stockQuantity: number, idealQuantity: number) {
    const response = await this.request.post('/api/inventory', {
      data: {
        productName,
        stockQuantity,
        idealQuantity
      }
    });
    return response;
  }

  async getInventory() {
    return await this.request.get('/api/inventory');
  }

  async updateProductStock(productStockId: string, data: any) {
    return await this.request.put(`/api/inventory/${productStockId}`, { data });
  }

  async deleteProductStock(productStockId: string) {
    return await this.request.delete(`/api/inventory/${productStockId}`);
  }

  // Métodos de Reportes
  async createPurchaseReport(data: {
    stockAdjustmentData: Array<{ productId: string, quantity: number }>,
    price: number
  }) {
    const response = await this.request.post('/api/reports/purchases', { data });
    return response;
  }

  async getPurchaseReports() {
    return await this.request.get('/api/reports/purchases');
  }

  async createUsageReport(data: {
    stockAdjustmentData: Array<{ productId: string, quantity: number }>,
    concept: string
  }) {
    const response = await this.request.post('/api/reports/usages', { data });
    return response;
  }

  async getUsageReports() {
    return await this.request.get('/api/reports/usages');
  }

  // Métodos de utilidad
  async extractIdFromResponse(response: any): Promise<string> {
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    return body;
  }

  async logRequestResponse(testName: string, response: any) {
    const status = response.status();
    const body = await response.text();
    console.log(`
══════════════════════════════════════════
Test: ${testName}
Status: ${status}
Response: ${body}
══════════════════════════════════════════
    `);
  }
}