export interface WorkerSearchSkill {
  id: string;
  name: string;
  category: string | null;
}

export interface WorkerSearchCertification {
  id: string;
  name: string;
  category: string | null;
  expiredAt: string | null;
}

export interface WorkerSearchResult {
  id: string;
  userId: string;
  fullName: string;
  displayAddress: string;
  latitude: number;
  longitude: number;
  avatarUrl: string;
  totalSkills: number;
  totalCertifications: number;
  skills: WorkerSearchSkill[];
  certifications: WorkerSearchCertification[];
}
