import React from 'react';

interface FormFieldProps {
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'textarea';
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
}

export function FormField({
  label,
  type,
  value,
  onChange,
  required = false,
  options = [],
  placeholder,
  min,
  max,
  className = '',
  disabled = false
}: FormFieldProps) {
  const baseClassName = `w-full border border-gray-300 rounded-md px-3 py-2 ${disabled ? 'bg-gray-100' : ''} ${className}`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={baseClassName}
        />
      )}

      {type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          required={required}
          min={min}
          max={max}
          disabled={disabled}
          className={baseClassName}
        />
      )}

      {type === 'date' && (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={baseClassName}
        />
      )}

      {type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={baseClassName}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {type === 'textarea' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={baseClassName}
        />
      )}
    </div>
  );
}

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitText?: string;
  cancelText?: string;
  submitting?: boolean;
}

export function FormActions({
  onCancel,
  onSubmit,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  submitting = false
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Guardando...' : submitText}
      </button>
    </div>
  );
}