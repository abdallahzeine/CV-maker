import { useState, useEffect } from 'react';
import type { SectionType, CVSection } from '../types';
import { uid } from '../utils/helpers';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (section: CVSection) => void;
}

const SECTION_TYPES: { type: SectionType; label: string; description: string }[] = [
  { type: 'summary', label: 'Professional Summary', description: 'A brief overview of your professional background' },
  { type: 'education', label: 'Education', description: 'Educational background and degrees' },
  { type: 'skills', label: 'Skills', description: 'Technical skills and competencies' },
  { type: 'certifications', label: 'Certifications', description: 'Professional certifications and licenses' },
  { type: 'projects', label: 'Projects', description: 'Project descriptions with achievements' },
  { type: 'awards', label: 'Awards', description: 'Awards, scholarships, and honors' },
  { type: 'volunteering', label: 'Volunteering', description: 'Volunteer work and leadership roles' },
];

export function SectionModal({ isOpen, onClose, onAddSection }: SectionModalProps) {
  const [sectionType, setSectionType] = useState<SectionType>('education');
  const [customTitle, setCustomTitle] = useState('');
  const [useCustomTitle, setUseCustomTitle] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSectionType('education');
      setCustomTitle('');
      setUseCustomTitle(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getDefaultTitle = (type: SectionType): string => {
    switch (type) {
      case 'summary': return 'PROFESSIONAL SUMMARY';
      case 'education': return 'EDUCATION';
      case 'skills': return 'SKILLS';
      case 'certifications': return 'CERTIFICATIONS';
      case 'projects': return 'PROJECTS';
      case 'awards': return 'AWARDS & SCHOLARSHIPS';
      case 'volunteering': return 'VOLUNTEERING & LEADERSHIP';
      default: return '';
    }
  };

  const handleSubmit = () => {
    const title = useCustomTitle && customTitle.trim() 
      ? customTitle.trim().toUpperCase() 
      : getDefaultTitle(sectionType);

    // Create default items based on section type
    let items: CVSection['items'] = [];
    
    switch (sectionType) {
      case 'summary':
        items = [{ id: uid(), body: '' }];
        break;
      case 'skills':
        items = [{ id: uid(), skillGroups: [] }];
        break;
      case 'education':
      case 'certifications':
      case 'projects':
      case 'awards':
      case 'volunteering':
        items = [{ id: uid(), title: '', subtitle: '', date: '' }];
        break;
    }

    const newSection: CVSection = {
      id: uid(),
      type: sectionType,
      title,
      items,
    };

    onAddSection(newSection);
    onClose();
  };

  const selectedTypeInfo = SECTION_TYPES.find(s => s.type === sectionType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add New Section</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Section Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Type
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {SECTION_TYPES.map((section) => (
                <button
                  key={section.type}
                  onClick={() => setSectionType(section.type)}
                  className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                    sectionType === section.type
                      ? 'border-violet-500 bg-violet-50 text-violet-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{section.label}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title Option */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={useCustomTitle}
                onChange={(e) => setUseCustomTitle(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
              />
              Use custom title
            </label>
            
            {useCustomTitle && (
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter section title..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            )}
            
            {!useCustomTitle && selectedTypeInfo && (
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                Default title: <span className="font-medium">{getDefaultTitle(sectionType)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
}
