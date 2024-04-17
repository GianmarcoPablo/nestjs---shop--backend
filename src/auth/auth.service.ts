import { hashSync, compareSync } from 'bcrypt';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { jwtPayload } from './interfaces/jwt-payload.inteface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: hashSync(password, 10)
      });
      await this.userRepository.save(user);
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }
    } catch (error) {
      console.log(error)
      this.handleDBError(error);
    }
  }

  async login(createUserDto: LoginUserDto) {
    try {
      const { email, password } = createUserDto;
      const user = await this.userRepository.findOne({ where: { email }, select: { email: true, password: true, id: true } })

      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const isPasswordMatch = compareSync(password, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException("Invalid credentials");
      }
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken(payload: jwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }


  private handleDBError(error: any): never {
    if (error.code === "23505") {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException("Something went wrong");
  }
}