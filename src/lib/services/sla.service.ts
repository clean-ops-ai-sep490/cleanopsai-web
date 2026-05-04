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
      throw new Error(`${fieldName} là bắt buộc`);
    }

    // Check if time matches expected formats
    const validFormats = [
      /^\d{1,2}:\d{2}$/, // H:MM or HH:MM
      /^\d{2}:\d{2}:\d{2}$/, // HH:MM:SS
    ];

    const isValidFormat = validFormats.some((format) => format.test(time));
    if (!isValidFormat) {
      throw new Error(`${fieldName} phải có định dạng HH:MM hoặc HH:MM:SS`);
    }

    // Parse and validate time range
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (hour < 0 || hour > 23) {
      throw new Error("Giờ phải nằm trong khoảng 00-23");
    }

    if (minute < 0 || minute > 59) {
      throw new Error("Phút phải nằm trong khoảng 00-59");
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
        `Ca "${shiftName}": Thời gian kết thúc phải sau thời gian bắt đầu`,
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
   * Transform recurrence config to API format
   */
  private static transformRecurrenceConfig(
    recurrenceType: string,
    config: any,
  ): any {
    console.log("Transform input:", { recurrenceType, config });

    if (recurrenceType === "Yearly") {
      // Check if we have the UI format with selectedMonth and daysOfMonth
      if (
        config.selectedMonth &&
        config.daysOfMonth &&
        Array.isArray(config.daysOfMonth) &&
        config.daysOfMonth.length > 0
      ) {
        // Transform from UI format to API format
        // UI: { interval, selectedMonth, daysOfMonth: [1, 9, 10] }
        // API: { interval, monthDays: [{ month: 2, day: 1 }, { month: 2, day: 9 }, ...] }
        const transformed = {
          interval: config.interval || 1,
          monthDays: config.daysOfMonth.map((day: number) => ({
            month: config.selectedMonth,
            day: day,
          })),
        };
        console.log("Transformed to:", transformed);
        return transformed;
      }

      // If already in API format, return as is
      if (config.monthDays && Array.isArray(config.monthDays)) {
        console.log("Already in API format");
        return config;
      }

      console.warn("Yearly config missing required fields:", config);
    }

    // For other types, return config as is
    console.log("Returning config as is");
    return config;
  }

  /**
   * Create SLA tasks for task requirements
   */
  private static async createSLATasks(
    slaId: string,
    taskRequirements: SLATaskRequirement[],
  ) {
    const taskPromises = taskRequirements.map((task) => {
      const transformedConfig = SLAService.transformRecurrenceConfig(
        task.recurrenceType,
        task.recurrenceConfig,
      );

      const taskData = {
        slaId,
        name: task.name,
        recurrenceType: task.recurrenceType,
        recurrenceConfig: transformedConfig,
      };

      console.log("Creating SLA Task with data:", taskData);

      return createSLATask(taskData);
    });

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
      throw new Error("Tên SLA là bắt buộc");
    }

    if (!basicInfo.contractId) {
      throw new Error("Vui lòng chọn hợp đồng");
    }

    if (!basicInfo.workAreaId) {
      throw new Error("Vui lòng chọn khu vực làm việc");
    }

    if (staffRequirements.length === 0) {
      throw new Error("Cần ít nhất một yêu cầu nhân sự");
    }

    if (taskRequirements.length === 0) {
      throw new Error("Cần ít nhất một yêu cầu công việc");
    }

    // Validate each staff requirement
    staffRequirements.forEach((staff, index) => {
      SLAService.validateTimeFormat(
        staff.startTime,
        `Nhân sự ${index + 1}: thời gian bắt đầu`,
      );
      SLAService.validateTimeFormat(
        staff.endTime,
        `Nhân sự ${index + 1}: thời gian kết thúc`,
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
            `Ca "${shifts[i].name}" và "${shifts[j].name}" bị trùng lặp thời gian`,
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
