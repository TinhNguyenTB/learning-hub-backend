import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigType } from "@nestjs/config";
import type { AuthJWTPayload } from "@/auth/types/auth-jwt-payload";
import { AuthService } from "../auth.service";
import refreshConfig from "@/auth/config/refresh-token.config";
import { Request } from "express";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
    constructor(@Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField("refresh"),
            secretOrKey: refreshTokenConfig.secret,
            ignoreExpiration: false,
            passReqToCallback: true
        })
    }

    async validate(req: Request, payload: AuthJWTPayload) {
        const userId = payload.id;
        const refreshToken = req.body.refresh;
        return await this.authService.validateRefreshToken(userId, refreshToken)
    }
}