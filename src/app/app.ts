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
}
