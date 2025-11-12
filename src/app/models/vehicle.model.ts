export interface Vehicle {
  id: number;
  customerId: number;
  make: string;
  model: string;
  initialRegistration: string;
  color: string;
  status: 'Verfügbar' | 'Reserviert' | 'Verkauft';
  equipmentFeatureIds: number[];
  ausstattung?: string[];
}
