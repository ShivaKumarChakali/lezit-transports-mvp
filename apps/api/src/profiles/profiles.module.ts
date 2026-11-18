import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'change-me-to-a-long-random-secret' })],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
