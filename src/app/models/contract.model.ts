export interface Contract {
  contractId: number;
  customerId: number;
  vehicleId: number;
  date: string;         
  price: number;        
  notes?: string;        
}