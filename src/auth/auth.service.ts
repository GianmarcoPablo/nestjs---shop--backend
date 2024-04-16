import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(createUserDto: LoginUserDto) {
    try {
      const { email, password } = createUserDto;
      const user = await this.userRepository.findOne({ where: { email }, select: { email: true, password: true } })

      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const isPasswordMatch = bcrypt.compareSync(password, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException("Invalid credentials");
      }
      return user;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  private handleDBError(error: any): never {
    if (error.code === "23505") {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException("Something went wrong");
  }
}