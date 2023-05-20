import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { EditUserDto } from './dto/user-edit.dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return { user };
  }

  @Patch('me')
  editUser(@GetUser('id') userId: User['id'], @Body() body: EditUserDto) {
    return this.userService.editUserById(userId, body);
  }
}
