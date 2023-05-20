import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto/user-edit.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUserById(id: number, data: EditUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    delete user.hashedPassword;
    return user;
  }
}
