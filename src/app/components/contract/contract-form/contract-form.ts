import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContractService } from '../../../services/contract.service';
import { VehicleService } from '../../../services/vehicle.service';
import { CustomerService } from '../../../services/customer.service';
import { Observable, combineLatest, map } from 'rxjs';
import { Contract } from '../../../models/contract.model';
import { Vehicle } from '../../../models/vehicle.model';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contract-form.html',
  styleUrls: ['./contract-form.css']
})
export class ContractForm implements OnInit, OnChanges {
  @Input() editId = 0;
  @Input() customerId = 0;
  form!: FormGroup;
  customers$!: Observable<Customer[]>;
  vehicles$!: Observable<Vehicle[]>;
  availableVehicles$!: Observable<Vehicle[]>;
  contracts$!: Observable<Contract[]>;

  constructor(
    private fb: FormBuilder,
    private cs: ContractService,
    private vs: VehicleService,
    private custService: CustomerService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      contractId: [0],
      customerId: [this.customerId || null, Validators.required],
      vehicleId: [null, Validators.required],
      date: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });

    this.customers$ = this.custService.getCustomers();
    this.vehicles$ = this.vs.getVehicles();
    this.contracts$ = this.cs.getContracts();

    // Filter Fahrzeuge ohne bestehenden Vertrag oder beim Edit das selbe Fahrzeug erlauben
    this.availableVehicles$ = combineLatest([this.vehicles$, this.contracts$]).pipe(
      map(([vehicles, contracts]) => {
        const taken = contracts
          .filter(c => c.contractId !== this.editId)
          .map(c => c.vehicleId);
        return vehicles.filter(v => !taken.includes(v.id));
      })
    );

    if (this.editId > 0) this.load(this.editId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editId'] && this.form) {
      const id = changes['editId'].currentValue;
      if (id > 0) this.load(id);
      else this.reset();
    }
    if (changes['customerId'] && this.form) {
      this.form.get('customerId')?.setValue(this.customerId || null);
    }
  }

  private load(id: number): void {
    this.cs.getContractById(id).subscribe(c => {
      if (c) this.form.patchValue(c);
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const data: Omit<Contract, 'contractId'> = {
      customerId: formValue.customerId,
      vehicleId: formValue.vehicleId,
      date: formValue.date,
      price: formValue.price,
      notes: formValue.notes
    };

    if (this.editId > 0) {
      const updateData = { ...data, contractId: this.editId } as Contract;
      this.cs.updateContract(updateData).subscribe({
        next: () => {
          this.reset();
        }});
    } else {
      this.cs.addContract(data).subscribe({
        next: (result) => {
          this.reset();
        }});
    }
  }

  reset(): void {
    this.form.reset({
      contractId: 0,
      customerId: this.customerId || null,
      vehicleId: null,
      date: '',
      price: 0,
      notes: ''
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
