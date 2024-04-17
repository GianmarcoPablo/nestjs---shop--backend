import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    // obtener los roles validos de la metadata
    const validRoles: string[] = this.reflector.get<string[]>(META_ROLES, context.getHandler());

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    if (!user) {
      throw new BadRequestException("No se ha encontrado el usuario en la petición");
    }

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true
      }
    }

    throw new ForbiddenException(`El usuario ${user.fullName} necesita tener uno de los siguientes roles: ${validRoles.join(", ")} para acceder a esta ruta`)
  }
}
