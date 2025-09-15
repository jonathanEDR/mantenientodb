import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface Filter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: FilterOption[];
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
}

interface MantenimientoFiltersProps {
  filters: Filter[];
  onAdd?: () => void;
  addButtonText?: string;
  title?: string;
}

export default function MantenimientoFilters({
  filters,
  onAdd,
  addButtonText = "Nuevo",
  title
}: MantenimientoFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              
              {filter.type === 'select' && (
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                >
                  <option value="">{filter.placeholder || `Todos los ${filter.label.toLowerCase()}`}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'text' && (
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  placeholder={filter.placeholder}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                />
              )}

              {filter.type === 'date' && (
                <input
                  type="date"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                />
              )}
            </div>
          ))}
        </div>

        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {addButtonText}
          </button>
        )}
      </div>
    </div>
  );
}