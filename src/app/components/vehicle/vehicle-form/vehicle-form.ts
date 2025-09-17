import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle.model';

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

  // Vordefinierte Ausstattungsoptionen
  availableEquipment = [
    'Anhängerkupplung',
    'Panoramadach', 
    'Ledersitze',
    'Klimaautomatik',
    'Navigationssystem',
    'Sitzheizung',
    'Automatikgetriebe',
    'Xenon-Scheinwerfer',
    'Start-Stop-System',
    'Bluetooth',
    'Tempomat',
    'Einparkhilfe',
    'Multifunktionslenkrad',
    'Allradantrieb',
    'Sportpaket',
    'Metallic-Lackierung',
    'CarPlay'
  ];

  constructor(private fb: FormBuilder, private vs: VehicleService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [0],
      customerId: [0, Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      initialRegistration: [''],
      color: [''],
      status: ['Verfügbar', Validators.required],
      ausstattung: this.fb.array([]) // FormArray für dynamische Ausstattung
    });

    // Falls editId schon gesetzt ist, direkt laden
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

  // FormArray Getter für Template
  get ausstattungArray(): FormArray {
    return this.form.get('ausstattung') as FormArray;
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

        // Ausstattung in FormArray laden
        this.clearAusstattung();
        v.ausstattung.forEach(item => {
          this.addAusstattungItem(item);
        });
      }
    });
  }

  // Ausstattungsmerkmal hinzufügen
  addAusstattungItem(value: string = ''): void {
    const ausstattungControl = new FormControl(value, Validators.required);
    this.ausstattungArray.push(ausstattungControl);
  }

  // Ausstattungsmerkmal entfernen
  removeAusstattungItem(index: number): void {
    this.ausstattungArray.removeAt(index);
  }

  // Alle Ausstattung löschen
  clearAusstattung(): void {
    while (this.ausstattungArray.length !== 0) {
      this.ausstattungArray.removeAt(0);
    }
  }

  // Vordefinierte Ausstattung hinzufügen
  addPredefinedEquipment(equipment: string): void {
    // Prüfen, ob bereits vorhanden
    const existingValues = this.ausstattungArray.value;
    if (!existingValues.includes(equipment)) {
      this.addAusstattungItem(equipment);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.form.value;
    const { id, ...vehicleData } = formValue;

    if (this.editId > 0) {
      // Update bestehender Fahrzeug
      this.vs.updateVehicle(formValue as Vehicle);
      alert('Fahrzeug aktualisiert');
    } else {
      // Neues Fahrzeug
      const newVehicle = vehicleData as Omit<Vehicle, 'id'>;
      this.vs.addVehicle(newVehicle);
      alert('Neues Fahrzeug hinzugefügt');
    }

    this.resetForm();
  }

  resetForm(): void {
    this.form.reset({
      id: 0,
      customerId: 0,
      make: '',
      model: '',
      initialRegistration: '',
      color: '',
      status: 'Verfügbar'
    });
    this.clearAusstattung();
    // Mindestens ein Ausstattungsfeld hinzufügen
    this.addAusstattungItem();
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

  // Hilfsmethode für Template: Prüfen ob Feld ungültig und berührt
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  // Hilfsmethode für Template: Fehlermeldung abrufen
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} ist erforderlich`;
      if (field.errors['email']) return 'Ungültige E-Mail-Adresse';
    }
    return '';
  }
}
