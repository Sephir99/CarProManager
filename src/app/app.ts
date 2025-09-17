import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerList } from './components/customer/customer-list/customer-list';
import { CustomerForm } from './components/customer/customer-form/customer-form';
import { VehicleList } from './components/vehicle/vehicle-list/vehicle-list';
import { VehicleForm } from './components/vehicle/vehicle-form/vehicle-form';
import { ContractList } from './components/contract/contract-list/contract-list';
import { ContractForm } from './components/contract/contract-form/contract-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CustomerList,
    CustomerForm,
    VehicleList,
    VehicleForm,
    ContractList,
    ContractForm
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // Bereichs-Titel
  protected readonly title = signal('CarProManager');

  // Aktueller Bereich
  currentSection = signal<'customers' | 'vehicles' | 'contracts'>('customers');

  // Anzeige: Liste oder Formular
  showList = signal(true);

  // IDs für Edit-Modus
  editId = signal(0);
  editContractId = signal(0);

  // Bereich wechseln
  showCustomers(): void {
    this.currentSection.set('customers');
    this.showList.set(true);
    this.editContractId.set(0);
  }

  showVehicles(): void {
    this.currentSection.set('vehicles');
    this.showList.set(true);
    this.editContractId.set(0);
  }

  showContracts(): void {
    this.currentSection.set('contracts');
    this.showList.set(true);
    // editId bleibt, damit customerId für ContractList gesetzt ist
    this.editContractId.set(0);
  }

  // Edit-Handler
  onEdit(id: number): void {
    this.editId.set(id);
    this.showList.set(false);
  }

  onEditContract(id: number): void {
    this.editContractId.set(id);
    this.showList.set(false);
  }

  // Zurück zur Liste
  onList(): void {
    this.showList.set(true);
    this.editContractId.set(0);
  }

  // Hilfsfunktionen
  isCustomerSection(): boolean {
    return this.currentSection() === 'customers';
  }
  isVehicleSection(): boolean {
    return this.currentSection() === 'vehicles';
  }
  isContractSection(): boolean {
    return this.currentSection() === 'contracts';
  }

  getCurrentTitle(): string {
    switch (this.currentSection()) {
      case 'customers': return 'CarPro Kundenverwaltung';
      case 'vehicles':  return 'CarPro Fahrzeugverwaltung';
      default:          return 'CarPro Vertragsverwaltung';
    }
  }

  getListButtonText(): string {
    switch (this.currentSection()) {
      case 'customers': return 'Kundenliste';
      case 'vehicles':  return 'Fahrzeugliste';
      default:          return 'Vertragsliste';
    }
  }

  getNewButtonText(): string {
    switch (this.currentSection()) {
      case 'customers': return 'Neuen Kunden';
      case 'vehicles':  return 'Neues Fahrzeug';
      default:          return 'Neuen Vertrag';
    }
  }
}
