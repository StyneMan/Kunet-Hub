import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserType } from 'src/enums/user.type.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({});
  }

  async validate(username: string, password: string, userType: UserType) {
    const user = await this.authService.validateUser(
      username,
      password,
      userType,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
