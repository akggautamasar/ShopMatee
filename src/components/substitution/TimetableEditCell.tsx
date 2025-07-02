
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { PeriodEntry } from '@/types/substitution';
import MultiTeacherPeriodEditor from './MultiTeacherPeriodEditor';
import MultiTeacherDisplay from './MultiTeacherDisplay';

interface TimetableEditCellProps {
  value: PeriodEntry;
  onSave: (newValue: PeriodEntry) => void;
  className?: string;
  nehaNameDisplay?: boolean;
  availableClasses?: string[];
}

const TimetableEditCell: React.FC<TimetableEditCellProps> = ({ 
  value, 
  onSave, 
  className,
  nehaNameDisplay = false,
  availableClasses = []
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newValue: PeriodEntry) => {
    onSave(newValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <MultiTeacherPeriodEditor
          value={value}
          onSave={handleSave}
          onCancel={handleCancel}
          availableClasses={availableClasses}
        />
      </div>
    );
  }

  return (
    <div className={`p-2 group cursor-pointer hover:bg-gray-50 relative ${className}`} onClick={() => setIsEditing(true)}>
      <MultiTeacherDisplay 
        entry={value} 
        nehaNameDisplay={nehaNameDisplay}
      />
      <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1" />
    </div>
  );
};

export default TimetableEditCell;
