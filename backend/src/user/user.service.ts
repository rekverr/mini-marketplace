import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private withoutPassword<T extends { passwordHash: string }>(user: T) {
    const { passwordHash, ...result } = user;
    void passwordHash;
    return result;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role,
      },
    });

    return this.withoutPassword(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.withoutPassword(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return this.withoutPassword(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return this.withoutPassword(updatedUser);
  }

  async remove(id: string) {
    await this.findOne(id);
    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });
    return this.withoutPassword(deletedUser);
  }
}
