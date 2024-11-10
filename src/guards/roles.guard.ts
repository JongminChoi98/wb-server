import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AuthenticatedRequest } from 'src/interfaces/authenticated-request.interface';
import { ROLES_KEY, UserRole } from '../user/decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    if (requiredRoles.includes(UserRole.Any)) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request>() as AuthenticatedRequest;
    const authHeader = request.headers.authorization;
    let token: string | undefined;

    if (authHeader) {
      [, token] = authHeader.split(' ');
    } else if (request.cookies && request.cookies.access_token) {
      token = request.cookies.access_token;
    }

    if (!token) {
      return false;
    }

    try {
      const user = this.jwtService.verify(token);
      request.user = user;
      return requiredRoles.includes(user.role);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const refreshToken = request.cookies?.refresh_token;
        if (refreshToken) {
          try {
            const newAccessToken =
              await this.authService.refreshAccessToken(refreshToken);
            request.cookies.access_token = newAccessToken;
            const user = this.jwtService.verify(newAccessToken);
            request.user = user;
            return requiredRoles.includes(user.role);
          } catch (err) {
            throw new UnauthorizedException('Invalid or expired refresh token');
          }
        }
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
