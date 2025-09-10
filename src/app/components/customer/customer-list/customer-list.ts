import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { AsyncPipe } from '@angular/common'
@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.css'],
  standalone: true,
  imports: [AsyncPipe]
})
export class CustomerList implements OnInit {
  customers$!: Observable<Customer[]>;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customers$ = this.customerService.getCustomers();
  }

  deleteCustomer(id: number): void {
    if (confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten?')) {
      this.customerService.deleteCustomer(id);
    }
  }
}
