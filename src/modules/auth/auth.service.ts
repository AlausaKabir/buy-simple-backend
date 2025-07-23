import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AuthResponse, JwtPayload, User } from 'src/common/interfaces';
import { LoginDto } from 'src/common/dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private users: User[] = [];
  private blacklistedTokens: Set<string> = new Set();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.loadAndHashUsers();
  }

  private async loadAndHashUsers(): Promise<void> {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'staff.json');
      const data = await fs.readFile(dataPath, 'utf8');
      const rawUsers = JSON.parse(data);
      
      // Hash passwords on first load (simulate what would happen in real DB)
      this.users = await Promise.all(
        rawUsers.map(async (user: any) => ({
          ...user,
          password: await bcrypt.hash(user.password, 12), // High salt rounds for security
        }))
      );
    } catch (error) {
      console.error('Error loading users:', error);
      throw new Error('Failed to initialize user data');
    }
  }

  async validateUser(email: string): Promise<Omit<User, 'password'> | null> {
    const user = this.users.find(user => user.email === email);
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = this.users.find(u => u.email === loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Use bcrypt for password comparison
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    // Add token to blacklist
    this.blacklistedTokens.add(token);
    
    // In production, you'd store this in Redis with TTL
    // Redis would automatically expire tokens based on JWT expiration
    return { message: 'Logged out successfully' };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  // Helper method for token extraction
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}