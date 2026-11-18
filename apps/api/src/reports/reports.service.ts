import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Basic operational reports (Phase 2): counts only, no advanced analytics.
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [usersByRole, usersByApproval, vehiclesByApproval, bookingsByStatus, tripsByStatus, attendanceByStatus] =
      await Promise.all([
        this.prisma.user.groupBy({ by: ['role'], _count: true }),
        this.prisma.user.groupBy({ by: ['approvalStatus'], _count: true }),
        this.prisma.vehicle.groupBy({ by: ['approvalStatus'], _count: true }),
        this.prisma.booking.groupBy({ by: ['status'], _count: true }),
        this.prisma.trip.groupBy({ by: ['status'], _count: true }),
        this.prisma.attendance.groupBy({ by: ['status'], _count: true }),
      ]);
    const [routes, schedules, activeSchedules] = await Promise.all([
      this.prisma.route.count(),
      this.prisma.schedule.count(),
      this.prisma.schedule.count({ where: { active: true } }),
    ]);
    const count = (rows: { _count: number }[]) => rows.reduce((n, r) => n + r._count, 0);
    return {
      users: { total: count(usersByRole), byRole: usersByRole, byApproval: usersByApproval },
      vehicles: { total: count(vehiclesByApproval), byApproval: vehiclesByApproval },
      routes,
      schedules: { total: schedules, active: activeSchedules },
      bookings: { total: count(bookingsByStatus), byStatus: bookingsByStatus },
      trips: { total: count(tripsByStatus), byStatus: tripsByStatus },
      attendance: { total: count(attendanceByStatus), byStatus: attendanceByStatus },
    };
  }
}
