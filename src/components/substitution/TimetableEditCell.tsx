
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";
import NehaNameDisplay from './NehaNameDisplay';

interface TimetableEditCellProps {
  value: {
    subject: string;
    teacher: string;
    time: string;
  };
  onSave: (newValue: { subject: string; teacher: string; time: string }) => void;
  className?: string;
  nehaNameDisplay?: boolean;
}

const TimetableEditCell: React.FC<TimetableEditCellProps> = ({ 
  value, 
  onSave, 
  className,
  nehaNameDisplay = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`p-2 space-y-1 ${className}`}>
        <Input
          value={editValue.subject}
          onChange={(e) => setEditValue({...editValue, subject: e.target.value})}
          placeholder="Subject"
          className="text-xs h-6"
        />
        <Input
          value={editValue.teacher}
          onChange={(e) => setEditValue({...editValue, teacher: e.target.value})}
          placeholder="Teacher"
          className="text-xs h-6"
        />
        <div className="flex gap-1">
          <Button size="sm" onClick={handleSave} className="h-6 px-2">
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-2 group cursor-pointer hover:bg-gray-50 ${className}`} onClick={() => setIsEditing(true)}>
      <div className="text-xs font-medium">{value.subject}</div>
      <div className="text-xs text-gray-600">
        {nehaNameDisplay ? (
          <NehaNameDisplay text={value.teacher} />
        ) : (
          value.teacher
        )}
      </div>
      <div className="text-xs text-gray-500">{value.time}</div>
      <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default TimetableEditCell;
