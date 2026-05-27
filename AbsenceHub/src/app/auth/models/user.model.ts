export enum UserRole {
  Employee = 'employee',
  Manager  = 'manager',
  Admin    = 'admin',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
