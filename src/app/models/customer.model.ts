export interface Customer {
    customerId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    street?: string;
    zipCode?: number;
    city?: string;
    newsletter: boolean;
  }
  