// Entity Card Component - Reusable card for displaying entities in drag-and-drop contexts

import React from 'react';
import { GripVertical, Edit2, Trash2, Info } from 'lucide-react';
import { Priority } from '../../types/entities';

interface EntityCardProps {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  priority?: Priority;
  assignee?: string;
  dueDate?: string;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onInfo?: (id: string) => void;
  children?: React.ReactNode;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'bg-blue-100 text-blue-700 border-blue-300',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700 border-orange-300',
  [Priority.URGENT]: 'bg-red-100 text-red-700 border-red-300',
  [Priority.CRITICAL]: 'bg-red-200 text-red-900 border-red-400',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.LOW]: 'Low',
  [Priority.MEDIUM]: 'Med',
  [Priority.HIGH]: 'High',
  [Priority.URGENT]: 'Urgent',
  [Priority.CRITICAL]: 'Critical',
};

export const EntityCard: React.FC<EntityCardProps> = ({
  id,
  title,
  subtitle,
  status,
  priority,
  assignee,
  dueDate,
  isDragging = false,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onInfo,
  children
}) => {
  return (
    <div
      className={`
        group relative bg-white border-2 rounded-lg p-4 transition-all
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : 'shadow-sm hover:shadow-md'}
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
      `}
      draggable
      onClick={(e) => {
        if (isSelected) onSelect?.(id, false);
        else if (!e.ctrlKey && !e.metaKey) onSelect?.(id, true);
      }}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect?.(id, e.target.checked)}
        className="absolute left-0 top-0 w-4 h-4 m-2 cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Content */}
      <div className="ml-6 pr-10">
        <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 truncate mt-1">{subtitle}</p>}

        {/* Meta Information */}
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          {priority && (
            <span className={`text-xs px-2 py-1 rounded border ${PRIORITY_COLORS[priority]}`}>
              {PRIORITY_LABELS[priority]}
            </span>
          )}
          {status && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
              {status}
            </span>
          )}
          {assignee && (
            <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">
              @{assignee}
            </span>
          )}
          {dueDate && (
            <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
              {new Date(dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {children}
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onInfo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInfo(id);
            }}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="View details"
          >
            <Info size={16} className="text-blue-600" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}
            className="p-1 hover:bg-amber-100 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} className="text-amber-600" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
};
