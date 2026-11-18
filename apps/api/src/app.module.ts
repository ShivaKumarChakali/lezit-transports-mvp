import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { DocumentsModule } from './documents/documents.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ReportsModule } from './reports/reports.module';
import { RoutesModule } from './routes/routes.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TripsModule } from './trips/trips.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AttendanceModule,
    BookingsModule,
    DocumentsModule,
    ProfilesModule,
    ReportsModule,
    RoutesModule,
    SchedulesModule,
    TripsModule,
    UsersModule,
    VehiclesModule,
  ],
})
export class AppModule {}
