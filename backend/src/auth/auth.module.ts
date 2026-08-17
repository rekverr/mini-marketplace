import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';

const accessSecret = process.env.JWT_ACCESS_SECRET;
if (!accessSecret) throw new Error('JWT_ACCESS_SECRET must be configured');

@Module({
  imports: [UserModule, JwtModule.register({ global: true, secret: accessSecret })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
