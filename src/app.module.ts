import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WaterintakeModule } from './waterintake/waterintake.module';

@Module({
  imports: [AuthModule, UserModule, WaterintakeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
