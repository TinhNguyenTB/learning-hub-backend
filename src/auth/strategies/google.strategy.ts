import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleAuthConfig from "@/auth/config/google-auth.config";
import { ConfigType } from "@nestjs/config";
import { AuthService } from "@/auth/auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(googleAuthConfig.KEY)
        private readonly googleConfig: ConfigType<typeof googleAuthConfig>,
        private readonly authService: AuthService
    ) {
        super({
            clientID: googleConfig.clientID,
            clientSecret: googleConfig.clientSecret,
            callbackURL: googleConfig.callbackURL,
            scope: ['email', 'profile']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        const user = await this.authService.validateGoogleUser({
            email: profile.emails[0].value,
            name: profile.displayName,
            password: '',
            image: profile.photos[0].value
        })
        done(null, user)
        // request.user
    }
}
