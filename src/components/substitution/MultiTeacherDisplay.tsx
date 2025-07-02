
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PeriodEntry } from '@/types/substitution';
import SpecialNameDisplay from './SpecialNameDisplay';

interface MultiTeacherDisplayProps {
  entry: PeriodEntry;
  nehaNameDisplay?: boolean;
}

const MultiTeacherDisplay: React.FC<MultiTeacherDisplayProps> = ({ 
  entry, 
  nehaNameDisplay = false 
}) => {
  const hasMultipleEntries = entry.additionalEntries && entry.additionalEntries.length > 0;

  return (
    <div className="space-y-1">
      {/* Primary Entry */}
      <div className="text-xs">
        <div className="font-medium">{entry.subject}</div>
        <div className="text-gray-600">
          {nehaNameDisplay ? (
            <SpecialNameDisplay text={entry.teacher} />
          ) : (
            entry.teacher
          )}
        </div>
      </div>

      {/* Additional Entries */}
      {hasMultipleEntries && (
        <div className="space-y-1 border-t pt-1">
          {entry.additionalEntries!.map((additional, index) => (
            <div key={index} className="text-xs">
              <div className="flex items-center gap-1">
                <Badge 
                  variant={additional.type === 'split' ? 'secondary' : 'outline'} 
                  className="text-xs px-1 py-0"
                >
                  {additional.type === 'split' ? 'Split' : 'Combined'}
                </Badge>
                <span className="font-medium">{additional.subject}</span>
              </div>
              <div className="text-gray-600">
                {nehaNameDisplay ? (
                  <SpecialNameDisplay text={additional.teacher} />
                ) : (
                  additional.teacher
                )}
              </div>
              {additional.type === 'combined' && additional.combinedClasses && (
                <div className="text-gray-500 text-xs">
                  with {additional.combinedClasses.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">{entry.time}</div>
    </div>
  );
};

export default MultiTeacherDisplay;
