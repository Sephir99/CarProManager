import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { CustomerList } from './components/customer/customer-list/customer-list'
import { CustomerForm } from './components/customer/customer-form/customer-form';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, CustomerList, CustomerForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CarProManager');
  showList = signal(true);

  editId = signal(0);

  // Wenn Bearbeiten geklickt
  onEdit(id: number): void {
    this.editId.set(id);
    this.showList.set(false);
  }

  // Zurück zur Liste
  onList(): void {
    this.showList.set(true);
    this.editId.set(0);
  }

}
