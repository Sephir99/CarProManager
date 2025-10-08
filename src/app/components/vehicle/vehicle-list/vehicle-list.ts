import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, map } from 'rxjs';
import { Vehicle } from '../../../models/vehicle.model';
import { VehicleService } from '../../../services/vehicle.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule],
  templateUrl: './vehicle-list.html',
  styleUrls: ['./vehicle-list.css']
})
export class VehicleList implements OnInit {
  vehicles$!: Observable<Vehicle[]>;
  allVehicles: Vehicle[] = [];
  filter = { 
    id: '', 
    make: '', 
    model: '', 
    color: '',
    status: '' as '' | 'Verfügbar' | 'Reserviert' | 'Verkauft'
  };

  @Output() editVehicle = new EventEmitter<number>();

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicles$ = this.vehicleService.getVehicles().pipe(
      map(list => {
        this.allVehicles = list;
        return list;
      })
    );
  }

  applyFilter(): void {
    const filtered = this.allVehicles.filter(v => {
      const matchesId = this.filter.id ? v.id === +this.filter.id : true;
      const matchesMake = this.filter.make 
        ? v.make.toLowerCase().includes(this.filter.make.toLowerCase()) 
        : true;
      const matchesModel = this.filter.model 
        ? v.model.toLowerCase().includes(this.filter.model.toLowerCase()) 
        : true;
      const matchesColor = this.filter.color 
        ? (v.color || '').toLowerCase().includes(this.filter.color.toLowerCase()) 
        : true;
      const matchesStatus = this.filter.status ? v.status === this.filter.status : true;
      
      return matchesId && matchesMake && matchesModel && matchesColor && matchesStatus;
    });
    this.vehicles$ = of(filtered);
  }

  resetFilter(): void {
    this.filter = { id: '', make: '', model: '', color: '', status: '' };
    this.vehicles$ = of(this.allVehicles);
  }

  deleteVehicle(id: number): void {
    if (confirm('Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten?')) {
      this.vehicleService.deleteVehicle(id).subscribe({
        next: () => {
          console.log('Fahrzeug gelöscht');
          this.loadVehicles(); // Liste neu laden
        },
        error: (err) => {
          console.error('Fehler beim Löschen:', err);
          alert('Fehler beim Löschen');
        }
      });
    }
  }

  editVehicleClick(id: number): void {
    this.editVehicle.emit(id);
  }

  changeStatus(vehicleId: number, newStatus: 'Verfügbar' | 'Reserviert' | 'Verkauft'): void {
    this.vehicleService.updateVehicleStatus(vehicleId, newStatus).subscribe({
      next: () => {
        console.log('Status geändert');
        this.loadVehicles(); // Liste neu laden
      },
      error: (err) => {
        console.error('Fehler beim Statuswechsel:', err);
        alert('Fehler beim Statuswechsel');
      }
    });
  }

  // Export-Methoden bleiben gleich...
  exportCsv(): void {
    const header = ['id', 'customerId', 'make', 'model', 'initialRegistration', 'color', 'status', 'ausstattung'];
    this.vehicles$.pipe(map(list => {
      const csvRows = [
        header.join(';'),
        ...list.map(v => [
          v.id, v.customerId, `"${v.make}"`, `"${v.model}"`,
          v.initialRegistration || '', `"${v.color || ''}"`,
          `"${v.status}"`, `"${v.ausstattung.join(', ')}"`
        ].join(';'))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fahrzeuge-export.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    })).subscribe();
  }

  exportJson(): void {
    this.vehicles$.pipe(map(list => {
      const jsonData = JSON.stringify(list, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fahrzeuge-export.json';
      link.click();
      window.URL.revokeObjectURL(url);
    })).subscribe();
  }

  exportXml(): void {
    this.vehicles$.pipe(map(list => {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<vehicles>\n';
      list.forEach(vehicle => {
        xml += '  <vehicle>\n';
        xml += `    <id>${vehicle.id}</id>\n`;
        xml += `    <customerId>${vehicle.customerId}</customerId>\n`;
        xml += `    <make>${vehicle.make}</make>\n`;
        xml += `    <model>${vehicle.model}</model>\n`;
        xml += `    <initialRegistration>${vehicle.initialRegistration || ''}</initialRegistration>\n`;
        xml += `    <color>${vehicle.color || ''}</color>\n`;
        xml += `    <status>${vehicle.status}</status>\n`;
        xml += '    <ausstattung>\n';
        vehicle.ausstattung.forEach(item => {
          xml += `      <item>${item}</item>\n`;
        });
        xml += '    </ausstattung>\n';
        xml += '  </vehicle>\n';
      });
      xml += '</vehicles>';

      const blob = new Blob([xml], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fahrzeuge-export.xml';
      link.click();
      window.URL.revokeObjectURL(url);
    })).subscribe();
  }
}
