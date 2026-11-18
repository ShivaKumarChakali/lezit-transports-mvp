import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'change-me-to-a-long-random-secret' })],
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
