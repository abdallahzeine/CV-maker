export type IconType = 
  | 'github' 
  | 'linkedin' 
  | 'twitter' 
  | 'globe' 
  | 'mail' 
  | 'phone'
  | 'portfolio'
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'custom';

export interface SocialLink {
  id: string;
  url: string;
  label: string;
  iconType: IconType;
  customIconUrl?: string;
  color?: string;
  displayOrder: number;
}

export interface CVHeader {
  name: string;
  location: string;
  phone: string;
  email: string;
  socialLinks: SocialLink[];
}

export type SectionType =
  | 'summary'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'projects'
  | 'awards'
  | 'volunteering';

export interface SkillGroup {
  id: string;
  label: string;
  value: string;
}

export interface CVItem {
  id: string;
  // For education, certifications, awards, volunteering
  title?: string;
  subtitle?: string;
  date?: string;
  role?: string;
  // For projects
  bullets?: string[];
  // For skills
  skillGroups?: SkillGroup[];
  // Generic extra text (summary body, etc.)
  body?: string;
}

export interface CVSection {
  id: string;
  type: SectionType;
  title: string;
  items: CVItem[];
}

export interface CVData {
  header: CVHeader;
  sections: CVSection[];
}
