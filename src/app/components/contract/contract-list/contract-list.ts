import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contract } from '../../../models/contract.model';
import { ContractService } from '../../../services/contract.service';
import { CustomerService } from '../../../services/customer.service';
import { VehicleService } from '../../../services/vehicle.service';
import { FormsModule } from '@angular/forms';

// Erweitertes Interface für die Anzeige
interface ContractDisplay {
  contractId: number;
  customerName: string;
  vehicleInfo: string;
  date: string;
  price: number;
}

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule],
  templateUrl: './contract-list.html',
  styleUrls: ['./contract-list.css']
})
export class ContractList implements OnInit {
  @Input() customerId = 0;
  
  // Verwende ContractDisplay statt Contract für die Anzeige
  contractsDisplay$!: Observable<ContractDisplay[]>;
  
  @Output() editContract = new EventEmitter<number>();

  constructor(
    private cs: ContractService,
    private customerService: CustomerService,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  delete(id: number): void {
    if (!confirm('Vertrag wirklich löschen?')) {
      return;
    }

    this.cs.deleteContract(id).subscribe({
      next: () => {
        console.log('✅ Contract deleted');
        this.reload();
      },
      error: (err) => {
        console.error('❌ Delete failed:', err);
        alert('Fehler beim Löschen');
      }
    });
  }

  edit(id: number): void {
    this.editContract.emit(id);
  }

  private reload(): void {
    const contracts$ = this.customerId > 0
      ? this.cs.getContractsByCustomerId(this.customerId)
      : this.cs.getContracts();

    this.contractsDisplay$ = combineLatest([
      contracts$,
      this.customerService.getCustomers(),
      this.vehicleService.getVehicles()
    ]).pipe(
      map(([contracts, customers, vehicles]) => {
        return contracts.map(contract => {
          const customer = customers.find(c => c.customerId === contract.customerId);
          const customerName = customer 
            ? `${customer.firstName} ${customer.lastName}`
            : `Kunde #${contract.customerId}`;

          const vehicle = vehicles.find(v => v.id === contract.vehicleId);
          const vehicleInfo = vehicle 
            ? `${vehicle.make} ${vehicle.model}`
            : `Fahrzeug #${contract.vehicleId}`;

          return {
            contractId: contract.contractId,
            customerName: customerName,
            vehicleInfo: vehicleInfo,
            date: contract.date,
            price: contract.price
          } as ContractDisplay;
        });
      })
    );
  }
}
