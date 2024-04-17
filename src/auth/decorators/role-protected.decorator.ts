import { SetMetadata } from '@nestjs/common';
import { ValidosRoles } from '../interfaces/valid-roles.interface';


export const META_ROLES = "roles";

export const RoleProtected = (...args: ValidosRoles[]) => {

    return SetMetadata(META_ROLES, args);
}
