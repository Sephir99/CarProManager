import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';
import { EquipmentFeature } from '../models/equipment-feature.model';
import { environment } from '../environments/environment';

interface BackendVehicle {
  id: number;
  brand: string;
  model: string;
  firstRegistration: string;
  color: string;
  status: number;
  equipmentFeatures: Array<{ id: number; name: string }>;
}

interface CreateVehicleDto {
  brand: string;
  model: string;
  firstRegistration: string;
  color: string;
  status: number;
  equipmentFeatureIds: number[];
}

interface UpdateVehicleDto {
  id: number;
  brand: string;
  model: string;
  firstRegistration: string;
  color: string;
  status: number;
  equipmentFeatureIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  private mapToFrontend(backend: BackendVehicle): Vehicle {
    return {
      id: backend.id,
      customerId: 0,
      make: backend.brand,
      model: backend.model,
      initialRegistration: backend.firstRegistration,
      color: backend.color,
      status: this.mapStatusToFrontend(backend.status),
      equipmentFeatureIds: backend.equipmentFeatures.map(ef => ef.id), 
      ausstattung: backend.equipmentFeatures.map(ef => ef.name) 
    };
  }

  private mapToBackendCreate(frontend: Omit<Vehicle, 'id'>): CreateVehicleDto {
    return {
      brand: frontend.make,
      model: frontend.model,
      firstRegistration: frontend.initialRegistration,
      color: frontend.color || '',
      status: this.mapStatusToBackend(frontend.status),
      equipmentFeatureIds: frontend.equipmentFeatureIds || []
    };
  }

  private mapToBackendUpdate(frontend: Vehicle): UpdateVehicleDto {
    return {
      id: frontend.id,
      brand: frontend.make,
      model: frontend.model,
      firstRegistration: frontend.initialRegistration,
      color: frontend.color || '',
      status: this.mapStatusToBackend(frontend.status),
      equipmentFeatureIds: frontend.equipmentFeatureIds || []
    };
  }

  private mapStatusToFrontend(backendStatus: number): 'Verfügbar' | 'Reserviert' | 'Verkauft' {
    switch (backendStatus) {
      case 0: return 'Verfügbar';
      case 1: return 'Reserviert';
      case 2: return 'Verkauft';
      default: return 'Verfügbar';
    }
  }

  private mapStatusToBackend(frontendStatus: 'Verfügbar' | 'Reserviert' | 'Verkauft'): number {
    switch (frontendStatus) {
      case 'Verfügbar': return 0;
      case 'Reserviert': return 1;
      case 'Verkauft': return 2;
      default: return 0;
    }
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<BackendVehicle[]>(this.apiUrl).pipe(
      map(backendVehicles => backendVehicles.map(v => this.mapToFrontend(v)))
    );
  }

  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<BackendVehicle>(`${this.apiUrl}/${id}`).pipe(
      map(backendVehicle => this.mapToFrontend(backendVehicle))
    );
  }

  getEquipmentFeatures(): Observable<EquipmentFeature[]> {
    return this.http.get<EquipmentFeature[]>(`${this.apiUrl}/features`);
  }

  addVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
    const dto = this.mapToBackendCreate(vehicle);
    return this.http.post<BackendVehicle>(this.apiUrl, dto).pipe(
      map(backendVehicle => this.mapToFrontend(backendVehicle))
    );
  }

  updateVehicle(vehicle: Vehicle): Observable<void> {
    const dto = this.mapToBackendUpdate(vehicle);
    return this.http.put<void>(`${this.apiUrl}/${vehicle.id}`, dto);
  }

  updateVehicleStatus(id: number, status: 'Verfügbar' | 'Reserviert' | 'Verkauft'): Observable<void> {
    const backendStatus = this.mapStatusToBackend(status);
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status: backendStatus });
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
