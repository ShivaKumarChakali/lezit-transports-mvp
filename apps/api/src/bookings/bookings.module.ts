import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'change-me-to-a-long-random-secret' })],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
