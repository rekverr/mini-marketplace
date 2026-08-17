import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    return this.userService.create({
      ...createUserDto,
      role: Role.CUSTOMER,
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException();
    }

    const revoked = await this.prisma.refreshToken.updateMany({
      where: { id: tokenRecord.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (revoked.count !== 1) throw new UnauthorizedException();

    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.role,
    );

    return {
      ...tokens,
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role,
      },
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  private parseDuration(value: string | undefined, fallbackMs: number) {
    const match = /^(\d+)([dhms])$/.exec(value || '');
    if (!match) return fallbackMs;
    const amount = Number(match[1]);
    const multiplier =
      match[2] === 'd'
        ? 86400000
        : match[2] === 'h'
          ? 3600000
          : match[2] === 'm'
            ? 60000
            : 1000;
    return amount * multiplier;
  }

  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) throw new Error('JWT_ACCESS_SECRET must be configured');

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: Math.floor(
        this.parseDuration(process.env.JWT_ACCESS_EXPIRES_IN, 15 * 60 * 1000) / 1000,
      ),
      issuer: process.env.JWT_ISSUER || 'mini-marketplace',
      audience: process.env.JWT_AUDIENCE || 'mini-marketplace-api',
    });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + this.parseDuration(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000));

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        expiresAt,
        userId,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
