import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: [
        '878577788391-3e586mjpdhtubj6vksn78s7k18u2sbsg.apps.googleusercontent.com',
      ],
      clientSecret: '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',
      callbackURL:
        'https://afrikunet-api-orcin.vercel.app/bkapi/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // done: VerifyCallback,
  ) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);

    // const user = await this.authService.validateUserGoogle({
    //   email_address: profile?.emails[0]?.value,
    //   first_name: profile?.displayName?.split[0],
    //   last_name: profile?.displayName?.split[1],
    //   photo: profile?.photos[0]?.value,
    // });
    // console.log('Validate');
    // console.log(user);
    // done(null, user);

    return {
      message: 'Logged in successfully',
      accessToken: accessToken,
      // user,
    };
  }
}
