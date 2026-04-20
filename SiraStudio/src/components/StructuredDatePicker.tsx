import type { StructuredDate } from '../types';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface StructuredDatePickerProps {
  label?: string;
  value: StructuredDate | 'present' | undefined;
  allowPresent?: boolean;
  onChange: (v: StructuredDate | 'present' | undefined) => void;
}

export function StructuredDatePicker({ label, value, allowPresent, onChange }: StructuredDatePickerProps) {
  const isPresent = value === 'present';
  const structured = (value && value !== 'present') ? value : null;

  const month = structured?.month ?? 0;
  const year = structured?.year ?? new Date().getFullYear();

  function emit(m: number, y: number) {
    onChange({ month: m === 0 ? null : m, year: y });
  }

  return (
    <div className="no-print flex items-center gap-1 text-xs">
      {label && <span className="text-gray-500 mr-1">{label}:</span>}
      <select
        disabled={isPresent}
        value={month}
        onChange={(e) => emit(Number(e.target.value), year)}
        className="border border-gray-200 rounded px-1 py-0.5 text-xs text-gray-700 bg-white disabled:opacity-40"
      >
        <option value={0}>—</option>
        {MONTHS.map((m, i) => (
          <option key={m} value={i + 1}>{m}</option>
        ))}
      </select>
      <input
        type="number"
        disabled={isPresent}
        value={year}
        min={1950}
        max={2030}
        onChange={(e) => emit(month, Number(e.target.value))}
        className="border border-gray-200 rounded px-1 py-0.5 text-xs text-gray-700 bg-white w-16 disabled:opacity-40"
      />
      {allowPresent && (
        <label className="flex items-center gap-0.5 text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPresent}
            onChange={(e) => {
              if (e.target.checked) onChange('present');
              else onChange({ month: month === 0 ? null : month, year });
            }}
            className="accent-gray-600"
          />
          Present
        </label>
      )}
    </div>
  );
}
