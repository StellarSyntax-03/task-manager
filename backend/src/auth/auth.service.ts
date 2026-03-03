import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto.name, dto.email, dto.password, dto.role);
    const token = this.signToken(user);
    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user);
    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private signToken(user: any) {
    return this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }
}
