import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConsultationStatus, UserRole } from '@prisma/client';
import { ReminderConfigDto } from 'src/reminder/dto/reminder-config.dto';

export class CreateParticipantDto {
  @ApiProperty({ description: "Participant's email" })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: [UserRole.EXPERT, UserRole.GUEST],
    description: "Participant's role",
  })
  @IsEnum([UserRole.EXPERT, UserRole.GUEST])
  role: UserRole;

  @ApiProperty({ description: "Participant's name" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Optional notes for the participant' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateConsultationDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNumber()
  patientId: number;

  @ApiPropertyOptional({ description: 'Practitioner ID (owner)' })
  @IsOptional()
  @IsNumber()
  ownerId?: number;

  @ApiPropertyOptional({ description: 'Scheduled date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @ApiPropertyOptional({ description: 'Group ID' })
  @IsOptional()
  @IsNumber()
  groupId?: number | null;

  @ApiPropertyOptional({ description: 'Speciality ID' })
  @IsOptional()
  @IsNumber()
  specialityId?: number | null;

  @ApiPropertyOptional({ description: 'Patient symptoms or notes' })
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional({ description: 'Create as draft (default false)' })
  @IsOptional()
  draft?: boolean;

  @ApiPropertyOptional({ description: 'Reminder configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderConfigDto)
  reminderConfig?: ReminderConfigDto;

  @ApiPropertyOptional({
    type: [CreateParticipantDto],
    description: 'Additional participants',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateParticipantDto)
  participants?: CreateParticipantDto[];
}

export class CreateConsultationWithTimeSlotDto extends CreateConsultationDto {
  @ApiProperty({ description: 'Time slot ID' })
  @IsNumber()
  timeSlotId: number;
}

/**
 * Participant DTO for consultation participants.
 */
export class ParticipantDto {
  @ApiProperty({ description: 'Participant ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'User ID of the participant' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Consultation ID' })
  @IsNumber()
  consultationId: number;

  @ApiProperty({ description: 'Participant role (e.g. PATIENT, DOCTOR)' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Whether participant is active in the consultation',
  })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Joined timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  joinedAt?: Date;
}

export class ConsultationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: ConsultationStatus })
  status: ConsultationStatus;

  @ApiPropertyOptional()
  ownerId?: number | null;

  @ApiProperty({ required: false })
  patientId?: number;

  @ApiPropertyOptional()
  scheduledDate?: Date;

  @ApiPropertyOptional()
  groupId?: number;

  @ApiPropertyOptional()
  specialityId?: number;

  @ApiPropertyOptional()
  symptoms?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ type: [ParticipantDto] })
  participants?: ParticipantDto[];
}
