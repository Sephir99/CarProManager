import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../models/vehicle.model';
import { environment } from '../environments/environment';
import { map, switchMap } from 'rxjs/operators';

// Backend DTOs
interface BackendVehicle {
  id: number;
  brand: string;
  model: string;
  firstRegistration: string;
  color: string;
  status: 0 | 1 | 2; // Available, Reserved, Sold
  equipmentFeatures: string[];
}

interface CreateVehicleDto {
  brand: string;
  model: string;
  firstRegistration: string;
  color: string;
  status: 0 | 1 | 2;
  equipmentFeatureIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) { }

  // Mapping: Backend Status → Frontend Status
  private mapStatusToFrontend(backendStatus: 0 | 1 | 2): 'Verfügbar' | 'Reserviert' | 'Verkauft' {
    switch (backendStatus) {
      case 0: return 'Verfügbar';
      case 1: return 'Reserviert';
      case 2: return 'Verkauft';
      default: return 'Verfügbar';
    }
  }

  // Mapping: Frontend Status → Backend Status
  private mapStatusToBackend(frontendStatus: 'Verfügbar' | 'Reserviert' | 'Verkauft'): 0 | 1 | 2 {
    switch (frontendStatus) {
      case 'Verfügbar': return 0;
      case 'Reserviert': return 1;
      case 'Verkauft': return 2;
      default: return 0;
    }
  }

  // Mapping: Backend → Frontend
  private mapToFrontend(backend: BackendVehicle): Vehicle {
    return {
      id: backend.id,
      customerId: 0, // Backend hat keine customerId - muss über Contracts gelöst werden
      make: backend.brand,
      model: backend.model,
      initialRegistration: backend.firstRegistration,
      color: backend.color,
      status: this.mapStatusToFrontend(backend.status),
      ausstattung: backend.equipmentFeatures
    };
  }

  // Mapping: Frontend → Backend (für Create/Update)
  private mapToBackend(frontend: Omit<Vehicle, 'id' | 'customerId'>): Omit<CreateVehicleDto, 'equipmentFeatureIds'> {
    return {
      brand: frontend.make,
      model: frontend.model,
      firstRegistration: frontend.initialRegistration || new Date().toISOString(),
      color: frontend.color || '',
      status: this.mapStatusToBackend(frontend.status)
    };
  }

  // READ - Alle Fahrzeuge
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<BackendVehicle[]>(this.apiUrl).pipe(
      map(vehicles => vehicles.map(v => this.mapToFrontend(v)))
    );
  }

  // READ - Einzelnes Fahrzeug
  getVehicleById(id: number): Observable<Vehicle | undefined> {
    return this.http.get<BackendVehicle>(`${this.apiUrl}/${id}`).pipe(
      map(v => this.mapToFrontend(v))
    );
  }

  // READ - Nach customerId filtern (nur Frontend-Filterung, da Backend keine customerId hat)
  getVehiclesByCustomerId(customerId: number): Observable<Vehicle[]> {
    return this.getVehicles().pipe(
      map(vehicles => vehicles.filter(v => v.customerId === customerId))
    );
  }

  // READ - Nach Status filtern
  getVehiclesByStatus(status: 'Verfügbar' | 'Reserviert' | 'Verkauft'): Observable<Vehicle[]> {
    return this.getVehicles().pipe(
      map(vehicles => vehicles.filter(v => v.status === status))
    );
  }

  // CREATE - Neues Fahrzeug
  addVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
    const dto: CreateVehicleDto = {
      ...this.mapToBackend(vehicle),
      equipmentFeatureIds: [] // Leer, da Backend EquipmentFeature IDs erwartet
    };
    return this.http.post<BackendVehicle>(this.apiUrl, dto).pipe(
      map(v => this.mapToFrontend(v))
    );
  }

  // UPDATE - Fahrzeug aktualisieren
  updateVehicle(updatedVehicle: Vehicle): Observable<void> {
    const dto: CreateVehicleDto = {
      ...this.mapToBackend(updatedVehicle),
      equipmentFeatureIds: []
    };
    return this.http.put<void>(`${this.apiUrl}/${updatedVehicle.id}`, dto);
  }

  // DELETE - Fahrzeug löschen
  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // UTILITY - Fahrzeugstatus ändern
  // UTILITY - Fahrzeugstatus ändern
  updateVehicleStatus(id: number, status: 'Verfügbar' | 'Reserviert' | 'Verkauft'): Observable<void> {
    return this.getVehicleById(id).pipe(
      switchMap(vehicle => {
        if (!vehicle) {
          throw new Error('Vehicle not found');
        }
        vehicle.status = status;
        return this.updateVehicle(vehicle);
      })
    );
  }


  // FILTER - Verfügbare Fahrzeuge
  getAvailableVehicles(): Observable<Vehicle[]> {
    return this.getVehiclesByStatus('Verfügbar');
  }

  // STATISTICS - Anzahl nach Status
  getVehicleCountByStatus(): Observable<{[key: string]: number}> {
    return this.getVehicles().pipe(
      map(vehicles => ({
        'Verfügbar': vehicles.filter(v => v.status === 'Verfügbar').length,
        'Reserviert': vehicles.filter(v => v.status === 'Reserviert').length,
        'Verkauft': vehicles.filter(v => v.status === 'Verkauft').length
      }))
    );
  }
}
