import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Attaches req.user when a valid JWT is sent, but lets anonymous visitors through. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: unknown, user: any) {
    return user || null;
  }
}
