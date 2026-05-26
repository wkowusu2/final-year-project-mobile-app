export type VehicleType = 'Car' | 'Taxi' | 'Trotro' | 'Bus' | 'Motorcycle' | 'Truck';

export type DriverRegistrationInput = {
  fullName: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  vehiclePlateNumber?: string;
};

export type DriverProfile = DriverRegistrationInput & {
  driverId: string;
  token: string;
};
