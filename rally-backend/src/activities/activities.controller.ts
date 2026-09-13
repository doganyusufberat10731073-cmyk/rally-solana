import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { JoinActivityDto } from './dto/join-activity.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/auth-payload.interface';
import { Request } from 'express';

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Public()
  @Get('featured')
  @ApiOperation({
    summary: 'Get featured/recent open activities for Home page',
    description: 'Returns the top 6 latest open activities.',
  })
  @ApiResponse({ status: 200, description: 'Featured activities', type: [ActivityResponseDto] })
  async getFeatured(@Req() req: Request): Promise<ActivityResponseDto[]> {
    const currentUserId = (req.user as any)?.id;
    return this.activitiesService.getFeatured(currentUserId);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Search and filter activities with pagination for Discover page',
    description: 'Filter by category, search keyword, online/in-person status, and open status.',
  })
  @ApiResponse({ status: 200, description: 'Paginated activities list' })
  async findAll(@Query() query: QueryActivityDto, @Req() req: Request) {
    const currentUserId = (req.user as any)?.id;
    return this.activitiesService.findAll(query, currentUserId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get activity detail by ID',
    description: 'Returns full activity details including host, participants, and status.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID', example: 'act_anchor_01' })
  @ApiResponse({ status: 200, description: 'Activity detail', type: ActivityResponseDto })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<ActivityResponseDto> {
    const currentUserId = (req.user as any)?.id;
    return this.activitiesService.findOne(id, currentUserId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new activity',
    description: 'Authenticated user is automatically designated as host and enrolled as creator participant.',
  })
  @ApiResponse({ status: 201, description: 'Activity created successfully', type: ActivityResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an existing activity',
    description: 'Allows only the creator to update details before the activity starts.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully', type: ActivityResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - only host can update' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.update(id, dto, user.id);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Join an activity as participant',
    description: 'Atomically reserves a spot. Fails if activity is full, cancelled, completed, or already joined.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Successfully joined activity', type: ActivityResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict: Activity is full or user already joined' })
  async join(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: JoinActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.join(id, user.id, dto);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Leave an activity',
    description: 'Removes participant and frees up a spot. Re-opens activity if it was full.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Successfully left activity', type: ActivityResponseDto })
  @ApiResponse({ status: 400, description: 'Creator cannot leave (must cancel)' })
  async leave(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.leave(id, user.id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel an activity (Creator only)',
    description: 'Marks activity as Cancelled and alerts all enrolled participants.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity cancelled', type: ActivityResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.cancel(id, user.id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark activity as completed (Creator only)',
    description: 'Finalizes the activity, confirms attendance, and distributes reputation points to participants and host.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity completed and reputation awarded', type: ActivityResponseDto })
  async complete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityResponseDto> {
    return this.activitiesService.complete(id, user.id);
  }
}
