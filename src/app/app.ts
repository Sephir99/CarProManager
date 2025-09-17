import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerList } from './components/customer/customer-list/customer-list';
import { CustomerForm } from './components/customer/customer-form/customer-form';
import { VehicleList } from './components/vehicle/vehicle-list/vehicle-list';
import { VehicleForm } from './components/vehicle/vehicle-form/vehicle-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CustomerList,
    CustomerForm,
    VehicleList,
    VehicleForm
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('CarProManager');
  
  // Navigation zwischen Bereichen
  currentSection = signal<'customers' | 'vehicles'>('customers');
  
  // Bestehende Logik beibehalten
  showList = signal(true);
  editId = signal(0);

  // === BEREICH WECHSELN ===
  
  showCustomers(): void {
    this.currentSection.set('customers');
    this.showList.set(true);
    this.editId.set(0);
  }

  showVehicles(): void {
    this.currentSection.set('vehicles');
    this.showList.set(true);
    this.editId.set(0);
  }

  // === BESTEHENDE LOGIK (unverändert) ===

  // Wenn Bearbeiten geklickt
  onEdit(id: number): void {
    this.editId.set(id);
    this.showList.set(false);
  }


  // Zurück zur Liste
  onList(): void {
    this.showList.set(true);
    this.editId.set(0);
  }

  // === HILFSMETHODEN ===

  isCustomerSection(): boolean {
    return this.currentSection() === 'customers';
  }

  isVehicleSection(): boolean {
    return this.currentSection() === 'vehicles';
  }

  getCurrentTitle(): string {
    return this.isCustomerSection() ? 'CarPro Kundenverwaltung' : 'CarPro Fahrzeugverwaltung';
  }

  getListButtonText(): string {
    return this.isCustomerSection() ? 'Kundenliste' : 'Fahrzeugliste';
  }

  getNewButtonText(): string {
    return this.isCustomerSection() ? 'Neuen Kunden' : 'Neues Fahrzeug';
  }
}
