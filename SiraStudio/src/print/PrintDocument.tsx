import type { CVData } from '../types';
import { SingleColumn } from '../templates/SingleColumn';
import { SidebarLayout } from '../templates/SidebarLayout';
import { HeaderPrint } from './HeaderPrint';
import { SectionListPrint } from './SectionListPrint';

interface PrintDocumentProps {
  doc: CVData;
}

export function PrintDocument({ doc }: PrintDocumentProps) {
  const TemplateShell = doc.template.id === 'single-column' ? SingleColumn : SidebarLayout;

  return (
    <TemplateShell documentId="cv-document-print" documentClassName="cv-document-print">
      <HeaderPrint header={doc.header} />
      <SectionListPrint sections={doc.sections} dateFormat={doc.dateFormat ?? 'MM/YYYY'} />
    </TemplateShell>
  );
}
