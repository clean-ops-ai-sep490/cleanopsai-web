import { createSLA, createSLAShift, createSLATask } from "@/lib/sla-api";
import type {
  SLABasicInfo,
  SLAStaffRequirement,
  SLATaskRequirement,
  SLA,
} from "@/types/sla";

/**
 * SLA Service - Handles complex SLA creation with related entities
 * Follows SRP by focusing only on SLA domain operations
 */
export class SLAService {
  /**
   * Format time from HH:MM to HH:MM:SS format for API
   */
  private static formatTimeForAPI(time: string): string {
    if (!time) return time;

    // If already in HH:MM:SS format, return as is
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return time;
    }

    // If in HH:MM format, add :00 seconds
    if (time.match(/^\d{2}:\d{2}$/)) {
      return `${time}:00`;
    }

    // If in H:MM format, pad with leading zero and add seconds
    if (time.match(/^\d{1}:\d{2}$/)) {
      return `0${time}:00`;
    }

    // If in H:M format, pad both and add seconds
    if (time.match(/^\d{1}:\d{1}$/)) {
      const [hour, minute] = time.split(":");
      return `0${hour}:0${minute}:00`;
    }

    return time;
  }
  /**
   * Validate time format and range
   */
  private static validateTimeFormat(time: string, fieldName: string): void {
    if (!time) {
      throw new Error(`${fieldName} is required`);
    }

    // Check if time matches expected formats
    const validFormats = [
      /^\d{1,2}:\d{2}$/, // H:MM or HH:MM
      /^\d{2}:\d{2}:\d{2}$/, // HH:MM:SS
    ];

    const isValidFormat = validFormats.some((format) => format.test(time));
    if (!isValidFormat) {
      throw new Error(`${fieldName} must be in HH:MM or HH:MM:SS format`);
    }

    // Parse and validate time range
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (hour < 0 || hour > 23) {
      throw new Error(`${fieldName}: Hour must be between 00-23`);
    }

    if (minute < 0 || minute > 59) {
      throw new Error(`${fieldName}: Minute must be between 00-59`);
    }
  }

  /**
   * Validate that end time is after start time
   */
  private static validateTimeOrder(
    startTime: string,
    endTime: string,
    shiftName: string,
  ): void {
    const formattedStart = SLAService.formatTimeForAPI(startTime);
    const formattedEnd = SLAService.formatTimeForAPI(endTime);

    const start = new Date(`1970-01-01T${formattedStart}`);
    const end = new Date(`1970-01-01T${formattedEnd}`);

    if (start >= end) {
      throw new Error(
        `Shift "${shiftName}": End time must be after start time`,
      );
    }
  }
  /**
   * Create complete SLA with shifts and tasks
   * Handles the complex business logic of creating related entities
   */
  static async createCompleteSLA(
    basicInfo: SLABasicInfo,
    staffRequirements: SLAStaffRequirement[],
    taskRequirements: SLATaskRequirement[],
  ): Promise<SLA> {
    // Validate business rules
    SLAService.validateSLACreation(
      basicInfo,
      staffRequirements,
      taskRequirements,
    );

    // Create SLA first
    const slaData = {
      name: basicInfo.slaName,
      environmentTypeId: basicInfo.environmentTypeId,
      serviceType: "Cleaning" as const,
      workAreaId: basicInfo.workAreaId,
      contractId: basicInfo.contractId,
    };

    const createdSLA = await createSLA(slaData);

    // Create related entities in parallel
    await Promise.all([
      SLAService.createSLAShifts(createdSLA.id, staffRequirements),
      SLAService.createSLATasks(createdSLA.id, taskRequirements),
    ]);

    return createdSLA;
  }

  /**
   * Create SLA shifts for staff requirements
   */
  private static async createSLAShifts(
    slaId: string,
    staffRequirements: SLAStaffRequirement[],
  ) {
    const shiftPromises = staffRequirements.map((staff) =>
      createSLAShift({
        slaId,
        name: staff.name,
        startTime: SLAService.formatTimeForAPI(staff.startTime),
        endTime: SLAService.formatTimeForAPI(staff.endTime),
        requiredWorker: staff.requiredWorker,
        breakTime: staff.breakTime,
      }),
    );

    return await Promise.all(shiftPromises);
  }

  /**
   * Create SLA tasks for task requirements
   */
  private static async createSLATasks(
    slaId: string,
    taskRequirements: SLATaskRequirement[],
  ) {
    const taskPromises = taskRequirements.map((task) =>
      createSLATask({
        slaId,
        name: task.name,
        recurrenceType: task.recurrenceType,
        recurrenceConfig: task.recurrenceConfig,
      }),
    );

    return await Promise.all(taskPromises);
  }

  /**
   * Validate SLA creation business rules
   */
  private static validateSLACreation(
    basicInfo: SLABasicInfo,
    staffRequirements: SLAStaffRequirement[],
    taskRequirements: SLATaskRequirement[],
  ): void {
    if (!basicInfo.slaName?.trim()) {
      throw new Error("SLA name is required");
    }

    if (!basicInfo.contractId) {
      throw new Error("Contract selection is required");
    }

    if (!basicInfo.workAreaId) {
      throw new Error("Work area selection is required");
    }

    if (staffRequirements.length === 0) {
      throw new Error("At least one staff requirement is needed");
    }

    if (taskRequirements.length === 0) {
      throw new Error("At least one task requirement is needed");
    }

    // Validate each staff requirement
    staffRequirements.forEach((staff, index) => {
      SLAService.validateTimeFormat(
        staff.startTime,
        `Staff ${index + 1} start time`,
      );
      SLAService.validateTimeFormat(
        staff.endTime,
        `Staff ${index + 1} end time`,
      );
      SLAService.validateTimeOrder(staff.startTime, staff.endTime, staff.name);
    });

    // Validate shift times don't overlap
    SLAService.validateShiftTimes(staffRequirements);
  }

  /**
   * Validate that shift times don't overlap
   */
  private static validateShiftTimes(
    staffRequirements: SLAStaffRequirement[],
  ): void {
    const shifts = staffRequirements.map((s) => ({
      start: s.startTime,
      end: s.endTime,
      name: s.name,
    }));

    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        if (SLAService.shiftsOverlap(shifts[i], shifts[j])) {
          throw new Error(
            `Shifts "${shifts[i].name}" and "${shifts[j].name}" have overlapping times`,
          );
        }
      }
    }
  }

  /**
   * Check if two shifts overlap
   */
  private static shiftsOverlap(
    shift1: { start: string; end: string },
    shift2: { start: string; end: string },
  ): boolean {
    // Format times to ensure consistent comparison
    const formattedStart1 = SLAService.formatTimeForAPI(shift1.start);
    const formattedEnd1 = SLAService.formatTimeForAPI(shift1.end);
    const formattedStart2 = SLAService.formatTimeForAPI(shift2.start);
    const formattedEnd2 = SLAService.formatTimeForAPI(shift2.end);

    const start1 = new Date(`1970-01-01T${formattedStart1}`);
    const end1 = new Date(`1970-01-01T${formattedEnd1}`);
    const start2 = new Date(`1970-01-01T${formattedStart2}`);
    const end2 = new Date(`1970-01-01T${formattedEnd2}`);

    return start1 < end2 && start2 < end1;
  }
}
