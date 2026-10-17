import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
    await this.prisma.refreshToken
      .delete({ where: { token: refreshToken } })
      .catch(() => undefined); // idempotent: aman bila sudah dihapus request paralel lain
    return this.issueTokens(stored.user);
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken
        .delete({ where: { token: refreshToken } })
        .catch(() => undefined);
    }
  }

  async verifyToken(token: string) {
    return this.jwt.verifyAsync(token);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.publicSelect,
    });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    return user;
  }

  private readonly publicSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    unit: true,
    avatar: true,
    bio: true,
    createdAt: true,
  } as const;

  private async issueTokens(user: {
    id: string;
    name?: string;
    email: string;
    role: string;
    unit: string | null;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role, unit: user.unit };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${user.id}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        unit: user.unit,
      },
      accessToken,
      refreshToken,
    };
  }
}
