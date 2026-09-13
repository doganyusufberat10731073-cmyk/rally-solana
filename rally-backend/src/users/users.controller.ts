import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/auth-payload.interface';

@ApiTags('Users & Profile')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user full profile',
    description: 'Returns profile with dynamically computed reputation metrics, attendance rate, completed activities, and people met.',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: UserProfileDto })
  async getMyProfile(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileDto> {
    return this.usersService.getUserProfile(user.id);
  }

  @Patch('me/profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Allows updating bio, avatar URL, or unique username.',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserProfileDto })
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Public()
  @Get('users/:id')
  @ApiOperation({
    summary: 'Get public user profile by ID, username or wallet address',
    description: 'Retrieves public profile details and reputation stats.',
  })
  @ApiParam({ name: 'id', description: 'User ID, username, or Solana wallet address' })
  @ApiResponse({ status: 200, description: 'Public profile retrieved successfully', type: UserProfileDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserProfileDto> {
    return this.usersService.getUserProfile(id);
  }
}
