import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, map } from 'rxjs';
import { Customer } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule],
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.css']
})
export class CustomerList implements OnInit {
  customers$!: Observable<Customer[]>;
  allCustomers: Customer[] = [];
  filter = { 
    customerId: '', 
    lastName: '', 
    email: '', 
    city: '', 
    newsletter: '' 
  };
  @Output() editCustomer = new EventEmitter<number>();

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customers$ = this.customerService.getCustomers().pipe(
      map(list => {
        this.allCustomers = list;
        return list;
      })
    );
  }

  applyFilter(): void {
    const filtered = this.allCustomers.filter(c => {
      const matchesId = this.filter.customerId
        ? c.customerId === +this.filter.customerId
        : true;
      const matchesLastName = this.filter.lastName
        ? c.lastName.toLowerCase().includes(this.filter.lastName.toLowerCase())
        : true;
      const matchesEmail = this.filter.email
        ? c.email.toLowerCase().includes(this.filter.email.toLowerCase())
        : true;
      const matchesCity = this.filter.city
        ? (c.city || '').toLowerCase().includes(this.filter.city.toLowerCase())
        : true;
      const matchesNewsletter = this.filter.newsletter
        ? c.newsletter === (this.filter.newsletter === 'true')
        : true;
      
      return matchesId && matchesLastName && matchesEmail && matchesCity && matchesNewsletter;
    });
    this.customers$ = of(filtered);
  }

  resetFilter(): void {
    this.filter = { 
      customerId: '', 
      lastName: '', 
      email: '', 
      city: '', 
      newsletter: '' 
    };
    this.customers$ = of(this.allCustomers);
  }

  deleteCustomer(id: number): void {
    if (confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          console.log('Kunde gelöscht');
          this.loadCustomers(); // Liste neu laden vom Server
        },
        error: (err) => {
          console.error('Fehler beim Löschen:', err);
          alert('Fehler beim Löschen');
        }
      });
    }
  }

  editCustomerClick(id: number): void {
    this.editCustomer.emit(id);
  }

  exportCsv(): void {
    const header = ['customerId', 'firstName', 'lastName', 'email', 'phoneNumber', 'street', 'zipCode', 'city', 'newsletter'];
    this.customers$.pipe(map(list => {
      const rows = [
        header.join(';'),
        ...list.map(c => header.map(f => `"${(c as any)[f] || ''}"`).join(';'))
      ];
      return rows.join('\n');
    })).subscribe(csv => {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'kunden-export.csv'; a.click();
      URL.revokeObjectURL(url);
    });
  }

  exportJson(): void {
    this.customers$.pipe(map(list => JSON.stringify(list, null, 2)))
      .subscribe(json => {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'kunden-export.json'; a.click();
        URL.revokeObjectURL(url);
      });
  }

  exportXml(): void {
    this.customers$.pipe(map(list => {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<customers>\n';
      list.forEach(c => {
        xml += '  <customer>\n';
        xml += `    <customerId>${c.customerId}</customerId>\n`;
        xml += `    <firstName>${c.firstName}</firstName>\n`;
        xml += `    <lastName>${c.lastName}</lastName>\n`;
        xml += `    <email>${c.email}</email>\n`;
        xml += `    <phoneNumber>${c.phoneNumber || ''}</phoneNumber>\n`;
        xml += `    <street>${c.street || ''}</street>\n`;
        xml += `    <zipCode>${c.zipCode || ''}</zipCode>\n`;
        xml += `    <city>${c.city || ''}</city>\n`;
        xml += `    <newsletter>${c.newsletter}</newsletter>\n`;
        xml += '  </customer>\n';
      });
      xml += '</customers>';
      return xml;
    })).subscribe(xml => {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'kunden-export.xml'; a.click();
      URL.revokeObjectURL(url);
    });
  }
}
