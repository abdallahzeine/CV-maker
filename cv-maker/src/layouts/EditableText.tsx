interface EditableTextProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export function EditableText({
  value,
  onChange,
  className = '',
  multiline = false,
  placeholder = 'Click to edit...',
}: EditableTextProps) {
  if (multiline) {
    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        className={`min-h-[1em] ${className} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
      />
    );
  }
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent ?? '')}
      data-placeholder={placeholder}
      className={`inline-block min-w-[40px] ${className} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
    >
      {value}
    </span>
  );
}
