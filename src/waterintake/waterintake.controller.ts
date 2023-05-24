import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { ParamDto, WaterintakeDto } from './dto';
import { WaterintakeService } from './waterintake.service';

@UseGuards(JwtGuard)
@Controller('waterintakes')
export class WaterintakeController {
  constructor(private waterintakeService: WaterintakeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  saveWaterintake(@GetUser('id') userId: User['id'], @Body() { amount }: WaterintakeDto) {
    return this.waterintakeService.saveWaterintake(userId, amount);
  }

  @Get()
  readAllWaterintakesById(@GetUser('id') userId: User['id']) {
    return this.waterintakeService.readAllWaterintakesById(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteWaterintake(@Param() { id: waterintakeId }: ParamDto, @GetUser('id') userId: User['id']) {
    this.waterintakeService.deleteWaterintakeById(waterintakeId, userId);
  }
}
