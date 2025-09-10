import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerList } from './components/customer-list';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CustomerList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CarProManager');
}
