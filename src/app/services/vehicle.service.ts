import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  // Mock-Daten für Fahrzeuge
  private vehicles: Vehicle[] = [
    {
      id: 1,
      customerId: 1, // Gehört zu Max Mustermann
      make: 'BMW',
      model: 'X3',
      initialRegistration: '2020-03-15',
      color: 'Schwarz',
      status: 'Verfügbar',
      ausstattung: ['Anhängerkupplung', 'Panoramadach', 'Ledersitze']
    },
    {
      id: 2,
      customerId: 2, // Gehört zu Mike Fast
      make: 'Audi',
      model: 'A4',
      initialRegistration: '2019-07-22',
      color: 'Weiß',
      status: 'Verkauft',
      ausstattung: ['Klimaautomatik', 'Navigationssystem']
    },
    {
      id: 3,
      customerId: 1, // Auch Max Mustermann
      make: 'Mercedes',
      model: 'C-Klasse',
      initialRegistration: '2021-11-08',
      color: 'Silber',
      status: 'Reserviert',
      ausstattung: ['Sitzheizung', 'Automatikgetriebe', 'Xenon-Scheinwerfer']
    },
    {
      id: 4,
      customerId: 0, // Noch kein Kunde zugeordnet
      make: 'Volkswagen',
      model: 'Golf',
      initialRegistration: '2022-01-12',
      color: 'Rot',
      status: 'Verfügbar',
      ausstattung: ['Start-Stop-System', 'Bluetooth']
    },
    {
      id: 5,
      customerId: 3, // Gehört zu Mikael Fastovic
      make: 'Ford',
      model: 'Focus',
      initialRegistration: '2018-09-05',
      color: 'Blau',
      status: 'Verfügbar',
      ausstattung: ['Tempomat', 'Einparkhilfe', 'Multifunktionslenkrad']
    }
  ];

  private vehiclesSubject = new BehaviorSubject<Vehicle[]>(this.vehicles);

  // READ - Alle Fahrzeuge
  getVehicles(): Observable<Vehicle[]> {
    return this.vehiclesSubject.asObservable();
  }

  // READ - Einzelnes Fahrzeug per ID
  getVehicleById(id: number): Observable<Vehicle | undefined> {
    const vehicle = this.vehicles.find(v => v.id === id);
    return of(vehicle);
  }

  // READ - Fahrzeuge nach Kunde filtern
  getVehiclesByCustomerId(customerId: number): Observable<Vehicle[]> {
    const customerVehicles = this.vehicles.filter(v => v.customerId === customerId);
    return of(customerVehicles);
  }

  // READ - Fahrzeuge nach Status filtern
  getVehiclesByStatus(status: 'Verfügbar' | 'Reserviert' | 'Verkauft'): Observable<Vehicle[]> {
    const filteredVehicles = this.vehicles.filter(v => v.status === status);
    return of(filteredVehicles);
  }

  // CREATE - Neues Fahrzeug hinzufügen
  addVehicle(vehicle: Omit<Vehicle, 'id'>): void {
    const maxId = this.vehicles.length > 0 ? Math.max(...this.vehicles.map(v => v.id)) : 0;
    const newVehicle: Vehicle = { ...vehicle, id: maxId + 1 };
    this.vehicles.push(newVehicle);
    this.vehiclesSubject.next([...this.vehicles]);
  }

  // UPDATE - Fahrzeug aktualisieren
  updateVehicle(updatedVehicle: Vehicle): void {
    const index = this.vehicles.findIndex(v => v.id === updatedVehicle.id);
    if (index !== -1) {
      this.vehicles[index] = updatedVehicle;
      this.vehiclesSubject.next([...this.vehicles]);
    }
  }

  // DELETE - Fahrzeug löschen
  deleteVehicle(id: number): void {
    this.vehicles = this.vehicles.filter(v => v.id !== id);
    this.vehiclesSubject.next([...this.vehicles]);
  }

  // UTILITY - Fahrzeugstatus ändern
  updateVehicleStatus(id: number, status: 'Verfügbar' | 'Reserviert' | 'Verkauft'): void {
    const vehicle = this.vehicles.find(v => v.id === id);
    if (vehicle) {
      vehicle.status = status;
      this.vehiclesSubject.next([...this.vehicles]);
    }
  }

  // UTILITY - Ausstattungsmerkmal hinzufügen
  addEquipment(vehicleId: number, equipment: string): void {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (vehicle && !vehicle.ausstattung.includes(equipment)) {
      vehicle.ausstattung.push(equipment);
      this.vehiclesSubject.next([...this.vehicles]);
    }
  }

  // UTILITY - Ausstattungsmerkmal entfernen
  removeEquipment(vehicleId: number, equipment: string): void {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      vehicle.ausstattung = vehicle.ausstattung.filter(e => e !== equipment);
      this.vehiclesSubject.next([...this.vehicles]);
    }
  }

  // FILTER - Verfügbare Fahrzeuge
  getAvailableVehicles(): Observable<Vehicle[]> {
    return this.getVehiclesByStatus('Verfügbar');
  }

  // STATISTICS - Fahrzeuganzahl nach Status
  getVehicleCountByStatus(): Observable<{[key: string]: number}> {
    const counts = {
      'Verfügbar': this.vehicles.filter(v => v.status === 'Verfügbar').length,
      'Reserviert': this.vehicles.filter(v => v.status === 'Reserviert').length,
      'Verkauft': this.vehicles.filter(v => v.status === 'Verkauft').length
    };
    return of(counts);
  }
}
