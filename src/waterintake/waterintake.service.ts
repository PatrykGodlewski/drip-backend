import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WaterintakeService {
  constructor(private prisma: PrismaService) {}

  async saveWaterintake(userId: number, amount: number) {
    return await this.prisma.waterintake.create({
      data: {
        amount,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async readAllWaterintakesById(userId: number) {
    return await this.prisma.waterintake.findMany({
      where: {
        userId,
      },
    });
  }

  async deleteWaterintakeById(waterintakeId: number, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        waterintakes: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const waterintake = user.waterintakes.find((waterintake) => waterintake.id === waterintakeId);

    if (!waterintake) {
      throw new ForbiddenException('Waterintake not found');
    }

    await this.prisma.waterintake.delete({
      where: {
        id: waterintake.id,
      },
    });
  }
}
