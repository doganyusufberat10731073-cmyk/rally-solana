import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReputationService } from './reputation.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/auth-payload.interface';

@ApiTags('Reputation')
@Controller('reputation')
@ApiBearerAuth()
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Get('history')
  @ApiOperation({
    summary: 'Get reputation score and history of events for current user',
    description: 'Returns total reputation score along with itemized history log.',
  })
  @ApiResponse({ status: 200, description: 'Reputation history and current score' })
  async getMyHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.reputationService.getReputationHistory(user.id);
  }
}
