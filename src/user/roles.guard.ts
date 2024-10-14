import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY, UserRole } from './decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // 역할이 지정되지 않은 경우 접근 허용
    }

    // UserRole.Any인 경우 토큰 없이 접근 허용
    if (requiredRoles.includes(UserRole.Any)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
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
      return requiredRoles.includes(user.role);
    } catch (e) {
      return false;
    }
  }
}
