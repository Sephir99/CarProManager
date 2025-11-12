import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { CustomerService } from '../../../services/customer.service';
import { Vehicle } from '../../../models/vehicle.model';
import { Customer } from '../../../models/customer.model';
import { EquipmentFeature } from '../../../models/equipment-feature.model'; // ✅ NEU
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-form.html',
  styleUrls: ['./vehicle-form.css']
})
export class VehicleForm implements OnInit, OnChanges {
  @Input() editId = 0;
  form!: FormGroup;

  customers$!: Observable<Customer[]>;
  
  // ✅ NEU: Equipment Features vom Backend
  availableEquipment: EquipmentFeature[] = [];

  constructor(
    private fb: FormBuilder, 
    private vs: VehicleService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [0],
      customerId: [null, Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      initialRegistration: [''],
      color: [''],
      status: ['Verfügbar', Validators.required],
      equipmentFeatureIds: this.fb.array([])
    });

    this.customers$ = this.customerService.getCustomers();
    
    this.vs.getEquipmentFeatures().subscribe(features => {
      this.availableEquipment = features;
    });

    if (this.editId > 0) {
      this.loadVehicle(this.editId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editId'] && this.form) {
      const id = changes['editId'].currentValue;
      if (id > 0) {
        this.loadVehicle(id);
      } else {
        this.resetForm();
      }
    }
  }

  get equipmentFeatureIdsArray(): FormArray {
    return this.form.get('equipmentFeatureIds') as FormArray;
  }

  private loadVehicle(id: number): void {
    this.vs.getVehicleById(id).subscribe(v => {
      if (v) {
        this.form.patchValue({
          id: v.id,
          customerId: v.customerId,
          make: v.make,
          model: v.model,
          initialRegistration: v.initialRegistration,
          color: v.color,
          status: v.status
        });

        this.clearEquipmentFeatures();
        
        if (v.equipmentFeatureIds) {
          v.equipmentFeatureIds.forEach(featureId => {
            this.addEquipmentFeature(featureId);
          });
        }
      }
    });
  }

  addEquipmentFeature(featureId: number | null = null): void {
    const control = new FormControl(featureId, Validators.required);
    this.equipmentFeatureIdsArray.push(control);
  }

  removeEquipmentFeature(index: number): void {
    this.equipmentFeatureIdsArray.removeAt(index);
  }

  clearEquipmentFeatures(): void {
    while (this.equipmentFeatureIdsArray.length !== 0) {
      this.equipmentFeatureIdsArray.removeAt(0);
    }
  }

  addPredefinedEquipment(featureId: number): void {
    const existingValues = this.equipmentFeatureIdsArray.value;
    if (!existingValues.includes(featureId)) {
      this.addEquipmentFeature(featureId);
    }
  }

  getFeatureName(featureId: number): string {
    const feature = this.availableEquipment.find(f => f.id === featureId);
    return feature ? feature.name : '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.form.value;
    const { id, ...vehicleData } = formValue;

    if (this.editId > 0) {
      this.vs.updateVehicle(formValue as Vehicle).subscribe({
        next: () => {
          alert('Fahrzeug aktualisiert');
          this.resetForm();
        },
        error: (err) => {
          console.error('Fehler:', err);
          alert('Fehler beim Aktualisieren');
        }
      });
    } else {
      const newVehicle = vehicleData as Omit<Vehicle, 'id'>;
      this.vs.addVehicle(newVehicle).subscribe({
        next: (created) => {
          alert('Neues Fahrzeug hinzugefügt');
          this.resetForm();
        },
        error: (err) => {
          console.error('Fehler:', err);
          alert('Fehler beim Erstellen');
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset({
      id: 0,
      customerId: null,
      make: '',
      model: '',
      initialRegistration: '',
      color: '',
      status: 'Verfügbar'
    });
    this.clearEquipmentFeatures();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormArray) {
          control.controls.forEach(c => c.markAsTouched());
        }
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} ist erforderlich`;
      if (field.errors['email']) return 'Ungültige E-Mail-Adresse';
    }
    return '';
  }
}
