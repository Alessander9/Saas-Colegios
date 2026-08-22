import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { EntitlementModule } from './modules/entitlement/entitlement.module';
import { PlatformModule } from './modules/platform/platform.module';
import { IdentityModule } from './modules/identity/identity.module';
import { SchoolCoreModule } from './modules/school-core/school-core.module';
import { EventBus } from './shared/events/event-bus.service';

@Module({
  imports: [
    HealthModule,
    EntitlementModule,
    PlatformModule,
    IdentityModule,
    SchoolCoreModule,
    // Upcoming Domain Modules (Fase 4..12):
    // EnrollmentModule,
    // AcademicModule,
    // FinanceModule,
    // CommerceModule,
    // ActivitiesModule,
    // HRModule,
    // PayrollModule,
    // ReportingModule
  ],
  providers: [EventBus],
  exports: [EventBus],
})
export class AppModule {}
