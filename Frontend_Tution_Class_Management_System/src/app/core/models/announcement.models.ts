export interface AnnouncementCreateRequest {
  title: string;
  message: string;
  targetClassId: number | null;
  expiresAt: string | null;
}

export interface AnnouncementResponse {
  id: number;
  title: string;
  message: string;
  postedByName: string;
  targetClassId: number | null;
  targetClassSubject: string | null;
  postedAt: string;
  expiresAt: string | null;
}
