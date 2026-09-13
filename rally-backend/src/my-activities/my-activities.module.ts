import { Module } from '@nestjs/common';
import { MyActivitiesController } from './my-activities.controller';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [ActivitiesModule],
  controllers: [MyActivitiesController],
})
export class MyActivitiesModule {}
