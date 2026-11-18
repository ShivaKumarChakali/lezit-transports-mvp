import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'change-me-to-a-long-random-secret' })],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
