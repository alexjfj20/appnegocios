import { Permission } from './permission';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
  userCount?: number;
}

export interface RoleForm {
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
} 