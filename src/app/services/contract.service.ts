import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Contract } from '../models/contract.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private contracts: Contract[] = [
    {
      contractId: 1,
      customerId: 1,   // Max Mustermann
      vehicleId: 1,    // BMW X3
      date: '2023-05-10',
      price: 35000,
      notes: 'Erstkauf, Inzahlungnahme Golf'
    },
    {
      contractId: 2,
      customerId: 2,   // Mike Fast
      vehicleId: 2,    // Audi A4
      date: '2024-02-20',
      price: 28000,
      notes: ''
    },
    {
      contractId: 3,
      customerId: 1,   // Max Mustermann
      vehicleId: 3,    // Mercedes C-Klasse
      date: '2025-01-15',
      price: 42000,
      notes: 'Reserviert im Dezember'
    },
    {
      contractId: 4,
      customerId: 3,   // Mikael Fastovic
      vehicleId: 5,    // Ford Focus
      date: '2024-11-05',
      price: 22000,
      notes: 'Leasingvertrag über 36 Monate'
    },
    {
      contractId: 5,
      customerId: 2,   // Mike Fast
      vehicleId: 4,    // Volkswagen Golf
      date: '2025-03-22',
      price: 19000,
      notes: 'Sonderrabatt 5%'
    }
  ];
  private contracts$ = new BehaviorSubject<Contract[]>(this.contracts);

  // Alle Verträge
  getContracts(): Observable<Contract[]> {
    return this.contracts$.asObservable();
  }

  // Einzelvertrag
  getContractById(id: number): Observable<Contract | undefined> {
    const c = this.contracts.find(x => x.contractId === id);
    return of(c);
  }

  // Verträge eines Kunden
  getContractsByCustomerId(customerId: number): Observable<Contract[]> {
    const list = this.contracts.filter(x => x.customerId === customerId);
    return of(list);
  }

  // Neuen Vertrag anlegen
  addContract(data: Omit<Contract,'contractId'>): void {
    const maxId = this.contracts.length
      ? Math.max(...this.contracts.map(x => x.contractId))
      : 0;
    this.contracts.push({ ...data, contractId: maxId + 1 });
    this.contracts$.next(this.contracts);
  }

  // Vertrag aktualisieren
  updateContract(updated: Contract): void {
    const idx = this.contracts.findIndex(x => x.contractId === updated.contractId);
    if (idx > -1) {
      this.contracts[idx] = updated;
      this.contracts$.next(this.contracts);
    }
  }

  // Vertrag löschen
  deleteContract(id: number): void {
    this.contracts = this.contracts.filter(x => x.contractId !== id);
    this.contracts$.next(this.contracts);
  }
}
