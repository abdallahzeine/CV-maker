import { EditableText } from './EditableText';

interface BodyBlockProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function BodyBlock({ value, onChange, placeholder = 'Write here...' }: BodyBlockProps) {
  return (
    <p className="text-gray-700 text-sm leading-relaxed text-left">
      <EditableText
        multiline
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-gray-700 text-sm leading-relaxed"
      />
    </p>
  );
}
