import type {
  SectionType, CVItem, SectionLayout, CustomSectionSchema,
  DateSlot, IconStyle, Separator, Density,
} from '../types';
import type { SectionCategory } from './categories';
import { summaryDef } from './summary';
import { workExperienceDef } from './work-experience';
import { educationDef } from './education';
import { skillsDef } from './skills';
import { certificationsDef } from './certifications';
import { projectsDef } from './projects';
import { awardsDef } from './awards';
import { volunteeringDef } from './volunteering';
import { customDef } from './custom';

export interface RenderItemProps {
  item: CVItem;
  layout: SectionLayout;
  index: number;
  total: number;
  onChange: (i: CVItem) => void;
  onMove: (d: -1 | 1) => void;
  onDelete: () => void;
  /** Only provided for custom sections */
  schema?: CustomSectionSchema;
}

export interface AllowedLayoutOptions {
  dateSlot: DateSlot[];
  iconStyle: IconStyle[];
  separator: Separator[];
  density: Density[];
  columns: (1 | 2)[];
}

export interface SectionDef {
  type: SectionType;
  label: string;
  description: string;
  defaultTitle: string;
  defaultLayout: SectionLayout;
  /** Recommended layout for professional CVs (used for guidance, not enforcement) */
  recommendedLayout: SectionLayout;
  allowedLayoutOptions: AllowedLayoutOptions;
  /** Skeleton category this section belongs to (drives wizard preview) */
  category: SectionCategory;
  /** If true, SectionRenderer hides the "Add item" button */
  singleItem: boolean;
  addItemLabel: string;
  availablePresetIds: string[];
  newItem: () => CVItem;
  renderItem: (props: RenderItemProps) => React.ReactNode;
}

export const sectionRegistry: Record<SectionType, SectionDef> = {
  summary: summaryDef,
  'work-experience': workExperienceDef,
  education: educationDef,
  skills: skillsDef,
  certifications: certificationsDef,
  projects: projectsDef,
  awards: awardsDef,
  volunteering: volunteeringDef,
  custom: customDef,
};
