import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { Customer } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { AsyncPipe, CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.css'],
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule]
})
export class CustomerList implements OnInit {
  customers$!: Observable<Customer[]>;
  allCustomers: Customer[] = [];
  filter = {
    lastName: '',
    customerId: '',
    newsletter: false
  };
  @Output() editCustomers = new EventEmitter<number>();
  
  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customers$ = this.customerService.getCustomers().pipe(
      tap(list => this.allCustomers = list),
      map(list => list)
    );
  }

  applyFilter(): void {
    const filtered = this.allCustomers.filter(c => {
      const matchesLastName = this.filter.lastName
        ? c.lastName.toLowerCase().includes(this.filter.lastName.toLowerCase())
        : true;
      const matchesId = this.filter.customerId
        ? c.customerId === +this.filter.customerId
        : true;
      const matchesNewsletter = this.filter.newsletter
        ? c.newsletter
        : true;
      return matchesLastName && matchesId && matchesNewsletter;
    });
    this.customers$ = of(filtered);
  }

  resetFilter(): void {
    this.filter = { lastName: '', customerId: '', newsletter: false };
    this.customers$ = of(this.allCustomers);
  }

  deleteCustomer(id: number): void {
    if (confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten?')) {
      this.customerService.deleteCustomer(id);
      // Aktualisiere lokale Liste
      this.allCustomers = this.allCustomers.filter(c => c.customerId !== id);
      this.customers$ = of(this.allCustomers);
    }
  }


  editCustomer(id: number): void {
    this.editCustomers.emit(id);
  }

  exportCsv(): void {
    const header = ['customerId', 'firstName', 'lastName', 'email', 'phoneNumber', 'street', 'zipCode', 'city', 'newsletter'];
    this.customers$.pipe(tap(), map(list => {
      const csvRows = [
        header.join(';'),
        ...list.map(c => header.map(field => `"${(c as any)[field] || ''}"`).join(';'))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kunden-export.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    })).subscribe();
  }
}
