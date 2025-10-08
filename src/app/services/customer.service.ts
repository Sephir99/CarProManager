import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { environment } from '../environments/environment';

// Backend DTOs
interface BackendCustomer {
  id: number;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  newsletterOptIn: boolean;
}

interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  newsletterOptIn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) { }

  // Mapping: Backend → Frontend
  private mapToFrontend(backend: BackendCustomer): Customer {
    return {
      customerId: backend.id,
      firstName: backend.firstName,
      lastName: backend.lastName,
      email: backend.email,
      phoneNumber: backend.phoneNumber || undefined,
      street: backend.street || undefined,
      zipCode: backend.postalCode ? parseInt(backend.postalCode) : undefined,
      city: backend.city || undefined,
      newsletter: backend.newsletterOptIn
    };
  }

  // Mapping: Frontend → Backend
  private mapToBackend(frontend: Omit<Customer, 'customerId'>): CreateCustomerDto {
    return {
      firstName: frontend.firstName,
      lastName: frontend.lastName,
      street: frontend.street || '',
      city: frontend.city || '',
      postalCode: frontend.zipCode?.toString() || '',
      phoneNumber: frontend.phoneNumber || '',
      email: frontend.email,
      newsletterOptIn: frontend.newsletter
    };
  }

  // READ - Alle Kunden
  getCustomers(): Observable<Customer[]> {
    return this.http.get<BackendCustomer[]>(this.apiUrl).pipe(
      map(customers => customers.map(c => this.mapToFrontend(c)))
    );
  }

  // READ - Einzelner Kunde
  getCustomerById(id: number): Observable<Customer | undefined> {
    return this.http.get<BackendCustomer>(`${this.apiUrl}/${id}`).pipe(
      map(c => this.mapToFrontend(c))
    );
  }

  // CREATE - Neuer Kunde
  addCustomer(customer: Omit<Customer, 'customerId'>): Observable<Customer> {
    const dto = this.mapToBackend(customer);
    return this.http.post<BackendCustomer>(this.apiUrl, dto).pipe(
      map(c => this.mapToFrontend(c))
    );
  }

  // UPDATE - Kunde aktualisieren
  updateCustomer(updatedCustomer: Customer): Observable<void> {
    const dto = this.mapToBackend(updatedCustomer);
    return this.http.put<void>(`${this.apiUrl}/${updatedCustomer.customerId}`, dto);
  }

  // DELETE - Kunde löschen
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // FILTER - Newsletter-Abonnenten
  getNewsletterSubscribers(): Observable<Customer[]> {
    return this.getCustomers().pipe(
      map(customers => customers.filter(c => c.newsletter))
    );
  }
}
