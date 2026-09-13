import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from '../activities/activities.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/auth-payload.interface';
import { ActivityResponseDto } from '../activities/dto/activity-response.dto';

@ApiTags('My Activities')
@Controller('me/activities')
@ApiBearerAuth()
export class MyActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all user activities grouped or filtered by tab',
    description: 'Supports tab parameter (joined | created | completed) or returns all three categories.',
  })
  @ApiQuery({ name: 'tab', required: false, enum: ['joined', 'created', 'completed'] })
  @ApiResponse({ status: 200, description: 'User activities' })
  async getMyActivities(
    @CurrentUser() user: AuthenticatedUser,
    @Query('tab') tab?: 'joined' | 'created' | 'completed',
  ) {
    return this.activitiesService.getMyActivities(user.id, tab);
  }

  @Get('joined')
  @ApiOperation({
    summary: 'Get activities joined by current user',
    description: 'Returns activities where the user is enrolled as a participant.',
  })
  @ApiResponse({ status: 200, description: 'Joined activities', type: [ActivityResponseDto] })
  async getJoinedActivities(@CurrentUser() user: AuthenticatedUser) {
    return this.activitiesService.getMyActivities(user.id, 'joined');
  }

  @Get('created')
  @ApiOperation({
    summary: 'Get activities created by current user',
    description: 'Returns activities hosted by current user.',
  })
  @ApiResponse({ status: 200, description: 'Created activities', type: [ActivityResponseDto] })
  async getCreatedActivities(@CurrentUser() user: AuthenticatedUser) {
    return this.activitiesService.getMyActivities(user.id, 'created');
  }

  @Get('completed')
  @ApiOperation({
    summary: 'Get finished activities attended or hosted by current user',
    description: 'Returns completed activities.',
  })
  @ApiResponse({ status: 200, description: 'Completed activities', type: [ActivityResponseDto] })
  async getCompletedActivities(@CurrentUser() user: AuthenticatedUser) {
    return this.activitiesService.getMyActivities(user.id, 'completed');
  }
}
