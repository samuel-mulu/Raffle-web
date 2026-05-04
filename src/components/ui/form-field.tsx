'use client';

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  multiline?: boolean;
  hint?: string;
}

export function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  options,
  multiline = false,
  hint
}: FormFieldProps) {
  const baseClasses = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 outline-none focus:border-[#f6d365]/50 focus:ring-4 focus:ring-[#f6d365]/10 transition-all text-sm";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center ml-1">
        <label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6d365]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && (
          <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">
            {hint}
          </span>
        )}
      </div>

      {options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`${baseClasses} appearance-none cursor-pointer`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1e293b] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={3}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          required={required}
          className={baseClasses}
        />
      )}
    </div>
  );
}
