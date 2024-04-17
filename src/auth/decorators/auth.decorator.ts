import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { ValidosRoles } from "../interfaces/valid-roles.interface";
import { AuthGuard } from "@nestjs/passport";
import { RoleProtected } from "./role-protected.decorator";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";

export function Auth(...roles: ValidosRoles[]) {
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard)
    )
}