import type { Request } from 'express';
import type { Role } from '@prisma/client';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    role: Role;
  };
};
