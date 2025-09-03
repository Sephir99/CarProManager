export interface Customer {
    customerId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    street?: string;
    zipCode?: string;
    city?: string;
    newsletter: boolean;
  }
  