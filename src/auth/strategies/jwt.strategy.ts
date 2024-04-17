import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { jwtPayload } from "../interfaces/jwt-payload.inteface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET')
        });
    }


    async validate(payload: jwtPayload): Promise<User> {
        const { id } = payload;
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user)
            throw new UnauthorizedException("Token not valid");

        if (user.isActive === false)
            throw new UnauthorizedException("User is inactive, please contact support");

        return user;
    }
}