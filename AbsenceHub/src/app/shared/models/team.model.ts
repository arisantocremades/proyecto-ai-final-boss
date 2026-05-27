import { UserRole } from '../../auth/models/user.model';

export interface Team {
  id: string;
  name: string;
  description: string;
  managerId: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId: string | null;
}
