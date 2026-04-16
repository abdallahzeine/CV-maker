import type { SectionType } from '../types';

export type SectionCategory = 'heading-date' | 'body-text' | 'title-bullets' | 'work-experience' | 'custom';

export interface CategoryDef {
  id: SectionCategory;
  label: string;
  description: string;
  types: SectionType[];
}

export const sectionCategories: CategoryDef[] = [
  {
    id: 'work-experience',
    label: 'Work Experience',
    description: 'Jobs and professional experience',
    types: ['work-experience'],
  },
  {
    id: 'heading-date',
    label: 'Titled Entry',
    description: 'Title with date and details',
    types: ['education', 'certifications', 'awards', 'volunteering'],
  },
  {
    id: 'body-text',
    label: 'Summary',
    description: 'Free-text paragraph block',
    types: ['summary'],
  },
  {
    id: 'title-bullets',
    label: 'Projects',
    description: 'Title with bullet points',
    types: ['projects'],
  },
  {
    id: 'custom',
    label: 'Custom Section',
    description: 'Define your own fields',
    types: ['custom'],
  },
];

export const categoryByType: Record<SectionType, SectionCategory> = {
  'work-experience': 'work-experience',
  education: 'heading-date',
  certifications: 'heading-date',
  awards: 'heading-date',
  volunteering: 'heading-date',
  summary: 'body-text',
  skills: 'body-text',
  projects: 'title-bullets',
  custom: 'custom',
};