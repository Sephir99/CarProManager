import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private customers: Customer[] = [
    { 
        customerId: 1, 
        firstName: 'Max', 
        lastName: 'Mustermann', 
        email: 'max@example.com', 
        newsletter: true 
    },
    {
        customerId: 2,
        firstName: 'Mike',
        lastName: 'Fast',
        email: 'mike.fast@ProCar.com',
        phoneNumber: '012485123',
        street: 'BigStreet',
        zipCode: 12412,
        city: 'Brunswick',
        newsletter: false
    },
    {
        customerId: 3,
        firstName: 'Mikael',
        lastName: 'Fastovic',
        email: 'faster.mike@ProCar.com',
        phoneNumber: '01215123',
        street: 'SmallStreet',
        zipCode: 12413,
        city: 'Brunswaick',
        newsletter: true
    }
  ];

  private customersSubject = new BehaviorSubject<Customer[]>(this.customers);

  getCustomers(): Observable<Customer[]> {
    return this.customersSubject.asObservable();
  }

  getCustomerById(id: number): Observable<Customer | undefined> {
    const customer = this.customers.find(c => c.customerId === id);
    return of(customer);
  }

  addCustomer(customer: Customer): void {
    this.customers.push(customer);
    this.customersSubject.next(this.customers);
  }

  updateCustomer(updatedCustomer: Customer): void {
    const index = this.customers.findIndex(c => c.customerId === updatedCustomer.customerId);
    if (index !== -1) {
      this.customers[index] = updatedCustomer;
      this.customersSubject.next([...this.customers]);
    }
  }
  
  deleteCustomer(id: number): void {
    this.customers = this.customers.filter(c => c.customerId !== id);
    this.customersSubject.next([...this.customers]);
  }
}
