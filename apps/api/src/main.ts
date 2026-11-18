import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ensureApprovedSuperAdmin } from './prisma/bootstrap-admin';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true });
  app.setGlobalPrefix('api');
  // Heal a locked-out deployment: if no approved super_admin exists, approve
  // the oldest pending one (the demo account). Same rule as prisma/seed.ts,
  // which never ran on Railway because its terminal would not connect.
  // Never blocks startup if the database is unreachable.
  try {
    const approvedEmail = await ensureApprovedSuperAdmin(app.get(PrismaService));
    if (approvedEmail) {
      // eslint-disable-next-line no-console
      console.log(`Approved existing pending super_admin on startup: ${approvedEmail}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Startup admin bootstrap skipped (database unavailable):', err);
  }
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`LEZIT API listening on http://localhost:${port}/api`);
}
bootstrap();
