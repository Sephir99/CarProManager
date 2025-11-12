import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contract } from '../models/contract.model';
import { environment } from '../environments/environment';

interface BackendContract {
  id: number;
  customerId: number;
  vehicleId: number;
  contractDate: string;
  price: number;
}

interface CreateContractDto {
  customerId: number;
  vehicleId: number;
  contractDate: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = `${environment.apiUrl}/purchasecontracts`;

  constructor(private http: HttpClient) { }

  // Mapping: Backend → Frontend
  private mapToFrontend(backend: BackendContract): Contract {
    return {
      contractId: backend.id,
      customerId: backend.customerId,
      vehicleId: backend.vehicleId,
      date: backend.contractDate,
      price: backend.price,
      notes: '' // Backend hat kein notes-Feld
    };
  }

  // Mapping: Frontend → Backend
  private mapToBackend(frontend: Omit<Contract, 'contractId'>): CreateContractDto {
    return {
      customerId: frontend.customerId,
      vehicleId: frontend.vehicleId,
      contractDate: frontend.date,
      price: frontend.price
    };
  }

  // READ - Alle Verträge
  getContracts(): Observable<Contract[]> {
    return this.http.get<BackendContract[]>(this.apiUrl).pipe(
      map(contracts => contracts.map(c => this.mapToFrontend(c)))
    );
  }

  // READ - Einzelvertrag
  getContractById(id: number): Observable<Contract | undefined> {
    return this.http.get<BackendContract>(`${this.apiUrl}/${id}`).pipe(
      map(c => this.mapToFrontend(c))
    );
  }

  // READ - Verträge eines Kunden
  getContractsByCustomerId(customerId: number): Observable<Contract[]> {
    return this.getContracts().pipe(
      map(contracts => contracts.filter(c => c.customerId === customerId))
    );
  }

  // CREATE - Neuer Vertrag
  addContract(data: Omit<Contract, 'contractId'>): Observable<Contract> {
    const dto = this.mapToBackend(data);
    return this.http.post<BackendContract>(this.apiUrl, dto).pipe(
      map(c => this.mapToFrontend(c))
    );
  }

  // UPDATE - Vertrag aktualisieren
  updateContract(updated: Contract): Observable<void> {
    const dto = this.mapToBackend(updated);
    return this.http.put<void>(`${this.apiUrl}/${updated.contractId}`, dto);
  }

  // DELETE - Vertrag löschen
  deleteContract(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
