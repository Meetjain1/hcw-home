import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { ConsultationGateway } from './consultation.gateway';
import { DatabaseService } from '../database/database.service';
import { ConfigModule } from '../config/config.module';
import { ConsultationCleanupService } from './consultation-cleanup.service';
import { ConsultationInvitationService } from './consultation-invitation.service';
import { AvailabilityModule } from '../availability/availability.module';
import { MediasoupModule } from '../mediasoup/mediasoup.module';
import { ReminderModule } from 'src/reminder/reminder.module';
import { ReminderService } from 'src/reminder/reminder.service';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [
    ConfigModule,
    AvailabilityModule,
    forwardRef(() => MediasoupModule),
    ReminderModule,
    EmailModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [ConsultationController],
  providers: [
    ConsultationService,
    ConsultationGateway,
    ConsultationCleanupService,
    ConsultationInvitationService,
    DatabaseService,
    {
      provide: 'CONSULTATION_GATEWAY',
      useExisting: ConsultationGateway,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [ConsultationService, ConsultationInvitationService],
})
export class ConsultationModule {}
