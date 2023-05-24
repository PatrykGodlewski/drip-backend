import { Module } from '@nestjs/common';
import { WaterintakeController } from './waterintake.controller';
import { WaterintakeService } from './waterintake.service';

@Module({
  controllers: [WaterintakeController],
  providers: [WaterintakeService]
})
export class WaterintakeModule {}
