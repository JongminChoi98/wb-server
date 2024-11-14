import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        this.jwtService.verify(token);
      } catch (e) {
        if (e.name === 'TokenExpiredError') {
          const refreshToken = req.cookies?.refresh_token;
          if (!refreshToken) {
            throw new UnauthorizedException('Refresh token missing');
          }

          try {
            const newAccessToken = await this.authService.refreshAccessToken(refreshToken);
            res.cookie('access_token', newAccessToken, { httpOnly: true });
            token = newAccessToken;
          } catch (err) {
            throw new UnauthorizedException('Invalid or expired refresh token');
          }
        } else {
          throw new UnauthorizedException('Invalid token');
        }
      }
    }
    next();
  }
}
