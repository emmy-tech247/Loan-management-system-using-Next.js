export interface Member {
  member_id: number;
  full_name: string;
}

export interface SupportChannel {
  title: string;
  description: string;
  href: string;
  iconName: string;
  badge?: string;
}
