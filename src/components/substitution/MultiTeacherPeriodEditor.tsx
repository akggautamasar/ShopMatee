
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Check, X } from "lucide-react";
import { PeriodEntry } from '@/types/substitution';

interface MultiTeacherPeriodEditorProps {
  value: PeriodEntry;
  onSave: (newValue: PeriodEntry) => void;
  onCancel: () => void;
  availableClasses?: string[];
}

const MultiTeacherPeriodEditor: React.FC<MultiTeacherPeriodEditorProps> = ({ 
  value, 
  onSave, 
  onCancel,
  availableClasses = [] 
}) => {
  const [editValue, setEditValue] = useState<PeriodEntry>({
    ...value,
    additionalEntries: value.additionalEntries || []
  });

  const addAdditionalEntry = () => {
    const newEntry = {
      subject: '',
      teacher: '',
      type: 'split' as const,
      combinedClasses: []
    };
    
    setEditValue({
      ...editValue,
      additionalEntries: [...(editValue.additionalEntries || []), newEntry]
    });
  };

  const removeAdditionalEntry = (index: number) => {
    const newEntries = [...(editValue.additionalEntries || [])];
    newEntries.splice(index, 1);
    setEditValue({
      ...editValue,
      additionalEntries: newEntries
    });
  };

  const updateAdditionalEntry = (index: number, field: string, value: any) => {
    const newEntries = [...(editValue.additionalEntries || [])];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value
    };
    setEditValue({
      ...editValue,
      additionalEntries: newEntries
    });
  };

  const handleSave = () => {
    onSave(editValue);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white max-w-2xl">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Edit Period Entry</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Primary Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Primary Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={editValue.subject}
              onChange={(e) => setEditValue({...editValue, subject: e.target.value})}
              placeholder="Subject"
            />
          </div>
          <div>
            <Label htmlFor="teacher">Teacher</Label>
            <Input
              id="teacher"
              value={editValue.teacher}
              onChange={(e) => setEditValue({...editValue, teacher: e.target.value})}
              placeholder="Teacher"
            />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              value={editValue.time}
              onChange={(e) => setEditValue({...editValue, time: e.target.value})}
              placeholder="Time"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Entries */}
      {editValue.additionalEntries && editValue.additionalEntries.length > 0 && (
        <div className="space-y-3">
          <Label>Additional Teachers/Subjects</Label>
          {editValue.additionalEntries.map((entry, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Additional Entry {index + 1}</CardTitle>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeAdditionalEntry(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={entry.type}
                    onValueChange={(value) => updateAdditionalEntry(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split">Split Class (Different subjects, same class)</SelectItem>
                      <SelectItem value="combined">Combined Classes (Multiple classes together)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={entry.subject}
                    onChange={(e) => updateAdditionalEntry(index, 'subject', e.target.value)}
                    placeholder="Subject"
                  />
                </div>
                <div>
                  <Label>Teacher</Label>
                  <Input
                    value={entry.teacher}
                    onChange={(e) => updateAdditionalEntry(index, 'teacher', e.target.value)}
                    placeholder="Teacher"
                  />
                </div>
                {entry.type === 'combined' && (
                  <div>
                    <Label>Combined Classes</Label>
                    <Input
                      value={entry.combinedClasses?.join(', ') || ''}
                      onChange={(e) => updateAdditionalEntry(index, 'combinedClasses', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      placeholder="e.g., XII B, XII C"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button onClick={addAdditionalEntry} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Additional Teacher/Subject
      </Button>
    </div>
  );
};

export default MultiTeacherPeriodEditor;
