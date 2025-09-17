import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Contract } from '../../../models/contract.model';
import { ContractService } from '../../../services/contract.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule],
  templateUrl: './contract-list.html',
  styleUrls: ['./contract-list.css']
})
export class ContractList implements OnInit {
  @Input() customerId = 0;
  contracts$!: Observable<Contract[]>;
  @Output() editContract = new EventEmitter<number>();

  constructor(private cs: ContractService) {}

  ngOnInit(): void {
    this.reload();
  }

  delete(id: number): void {
    if (confirm('Vertrag löschen?')) {
      this.cs.deleteContract(id);
      this.reload();
    }
  }

  edit(id: number): void {
    this.editContract.emit(id);
  }

  private reload(): void {
    if (this.customerId > 0) {
      this.contracts$ = this.cs.getContractsByCustomerId(this.customerId);
    } else {
      this.contracts$ = this.cs.getContracts();
    }
  }
}
