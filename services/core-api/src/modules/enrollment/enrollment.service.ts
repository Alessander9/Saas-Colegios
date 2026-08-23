import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { db, withTransactionAndOutbox, EnrollmentStatus, AdmissionStatus } from '@cole/database';
import { DomainEvent } from '@cole/domain-types';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateAdmissionApplicationDto,
  UpdateAdmissionStatusDto,
  EnrollStudentDto,
} from './dto/enrollment.dto';

@Injectable()
export class EnrollmentService {
  // --------------------------------------------------
  // ADMISSION PIPELINE
  // --------------------------------------------------

  async createAdmissionApplication(
    tenantId: string,
    dto: CreateAdmissionApplicationDto
  ): Promise<any> {
    return await db.admissionApplication.create({
      data: {
        tenantId,
        academicYearId: dto.academicYearId,
        gradeId: dto.gradeId,
        studentId: dto.studentId,
        applicantName: dto.applicantName,
        applicantDoc: dto.applicantDoc,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        notes: dto.notes,
        status: AdmissionStatus.SUBMITTED,
      },
      include: {
        grade: { include: { level: true } },
        academicYear: true,
      },
    });
  }

  async getAdmissions(tenantId: string, status?: AdmissionStatus): Promise<any[]> {
    return await db.admissionApplication.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      include: {
        grade: { include: { level: true } },
        academicYear: true,
        student: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateAdmissionStatus(
    tenantId: string,
    id: string,
    dto: UpdateAdmissionStatusDto
  ): Promise<any> {
    const admission = await db.admissionApplication.findFirst({
      where: { id, tenantId },
    });
    if (!admission) {
      throw new NotFoundException(`Admission application with ID ${id} not found`);
    }

    return await db.admissionApplication.update({
      where: { id },
      data: {
        status: dto.status,
        evaluationScore: dto.evaluationScore,
        notes: dto.notes,
      },
      include: {
        grade: { include: { level: true } },
        academicYear: true,
      },
    });
  }

  // --------------------------------------------------
  // FORMAL ENROLLMENT & SECTION ASSIGNMENT
  // --------------------------------------------------

  async enrollStudent(tenantId: string, dto: EnrollStudentDto): Promise<any> {
    // 1. Verify Student exists in tenant
    const student = await db.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found in this school`);
    }

    // 2. Check for duplicate enrollment in same academic year
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        tenantId_academicYearId_studentId: {
          tenantId,
          academicYearId: dto.academicYearId,
          studentId: dto.studentId,
        },
      },
    });
    if (existingEnrollment) {
      throw new ConflictException(
        'Student is already enrolled in this school for the selected academic year'
      );
    }

    // 3. Verify Section & Vacancies Capacity
    const section = await db.section.findFirst({
      where: {
        id: dto.sectionId,
        tenantId,
        academicYearId: dto.academicYearId,
        gradeId: dto.gradeId,
      },
      include: {
        _count: {
          select: {
            enrollments: {
              where: { status: { not: EnrollmentStatus.CANCELLED } },
            },
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(
        'Target section does not exist or does not match the selected grade and academic year'
      );
    }

    if (section._count.enrollments >= section.maxCapacity) {
      throw new ForbiddenException(
        `Section '${section.name}' has reached its maximum capacity (${section.maxCapacity} students)`
      );
    }

    // 4. Generate enrollment code and outbox event
    const enrollmentId = uuidv4();
    const enrollmentCode = `MAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const enrollmentConfirmedEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'EnrollmentConfirmed.v1',
      occurredAt: new Date().toISOString(),
      tenantId,
      aggregateId: enrollmentId,
      version: 1,
      payload: {
        enrollmentCode,
        studentId: student.id,
        academicYearId: dto.academicYearId,
        gradeId: dto.gradeId,
        sectionId: dto.sectionId,
        status: dto.status || EnrollmentStatus.CONFIRMED,
      },
    };

    return await withTransactionAndOutbox(db, tenantId, [enrollmentConfirmedEvent], async (tx) => {
      const enrollment = await (tx as typeof db).enrollment.create({
        data: {
          id: enrollmentId,
          tenantId,
          code: enrollmentCode,
          studentId: student.id,
          academicYearId: dto.academicYearId,
          gradeId: dto.gradeId,
          sectionId: dto.sectionId,
          status: dto.status || EnrollmentStatus.CONFIRMED,
        },
        include: {
          student: true,
          academicYear: true,
          grade: { include: { level: true } },
          section: true,
        },
      });

      return enrollment;
    });
  }

  async getEnrollments(tenantId: string, academicYearId?: string): Promise<any[]> {
    return await db.enrollment.findMany({
      where: {
        tenantId,
        ...(academicYearId ? { academicYearId } : {}),
      },
      include: {
        student: true,
        academicYear: true,
        grade: { include: { level: true } },
        section: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }
}
