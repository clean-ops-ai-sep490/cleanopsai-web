export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

// Predefined work shifts
export const PREDEFINED_SHIFTS: WorkShift[] = [
  {
    id: "morning",
    name: "Ca sáng",
    startTime: "07:00",
    endTime: "15:00",
  },
  {
    id: "afternoon",
    name: "Ca chiều",
    startTime: "14:00",
    endTime: "22:00",
  },
  // {
  //   id: "night",
  //   name: "Ca đêm",
  //   startTime: "22:00",
  //   endTime: "06:00",
  // },
  // {
  //   id: "custom",
  //   name: "Ca tùy chỉnh",
  //   startTime: "",
  //   endTime: "",
  // },
];
