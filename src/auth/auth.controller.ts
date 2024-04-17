import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeader } from './decorators/raw-header.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidosRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post("login")
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get("check-auth-status")
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get("private")
  @UseGuards(AuthGuard("jwt"))
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser("email") email: string,
    @RawHeader() rawHeader: string[]
  ) {
    return {
      ok: true,
      msg: "Ruta privada, solo para usuarios autenticados",
      user,
      email,
      rawHeader
    }
  }


  @Get("private2")
  @RoleProtected(ValidosRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      user,
    }
  }

  @Get("private3")
  @Auth(ValidosRoles.superUser)
  privateRoute3(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      user,
    }
  }
}
