import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Users, Phone, Calendar, RefreshCw, FileUp, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubstitution, Teacher } from '@/context/SubstitutionContext';
import NehaNameDisplay from './NehaNameDisplay';
import PhotoUpload from "../PhotoUpload";

const StaffModule = () => {
  const { state, saveTeacher, updateTeacher, deleteTeacher, loadTeachers, syncTeacherSchedules } = useSubstitution();
  const { teachers, periods, loading } = state;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingScheduleTeacher, setViewingScheduleTeacher] = useState<Teacher | null>(null);
  const [editingScheduleTeacher, setEditingScheduleTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    post: '',
    contactNumber: '',
    photo_url: '', // NEW
  });
  const { toast } = useToast();

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // State for import/export handling
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.subject.trim() || !formData.post.trim() || !formData.contactNumber.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const schedule: { [day: string]: { [period: string]: string } } = {};
    DAYS.forEach(day => {
      schedule[day] = {};
      periods.forEach(period => {
        schedule[day][period] = 'FREE';
      });
    });

    try {
      if (editingTeacher) {
        await updateTeacher({
          ...editingTeacher,
          ...formData,
          photo_url: formData.photo_url || undefined,
          schedule: editingTeacher.schedule
        });
        toast({ title: "Teacher updated successfully" });
      } else {
        await saveTeacher({
          ...formData,
          photo_url: formData.photo_url || undefined,
          schedule
        });
        toast({ title: "Teacher added successfully" });
      }
      
      setIsDialogOpen(false);
      setEditingTeacher(null);
      setFormData({ name: '', subject: '', post: '', contactNumber: '', photo_url: '' });
    } catch (error) {
      console.error('Error saving teacher:', error);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      subject: teacher.subject,
      post: teacher.post,
      contactNumber: teacher.contactNumber,
      photo_url: teacher.photo_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleViewSchedule = (teacher: Teacher) => {
    setViewingScheduleTeacher(teacher);
    setIsScheduleDialogOpen(true);
  };

  const handleEditSchedule = (teacher: Teacher) => {
    setEditingScheduleTeacher(teacher);
    setIsEditScheduleDialogOpen(true);
  };

  const handleScheduleChange = (day: string, period: string, value: string) => {
    if (!editingScheduleTeacher) return;
    
    const updatedTeacher = { 
      ...editingScheduleTeacher,
      schedule: {
        ...editingScheduleTeacher.schedule,
        [day]: {
          ...editingScheduleTeacher.schedule[day],
          [period]: value
        }
      }
    };
    
    setEditingScheduleTeacher(updatedTeacher);
  };

  const saveScheduleChanges = async () => {
    if (!editingScheduleTeacher) return;
    
    try {
      await updateTeacher(editingScheduleTeacher);
      toast({ title: "Schedule updated successfully" });
      setIsEditScheduleDialogOpen(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({ title: "Failed to update schedule", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await deleteTeacher(id);
        toast({ title: "Teacher deleted successfully" });
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', subject: '', post: '', contactNumber: '', photo_url: '' });
    setEditingTeacher(null);
  };

  const handleSyncSchedules = async () => {
    setIsSyncing(true);
    try {
      syncTeacherSchedules();
      await loadTeachers();
      toast({ title: "Schedules synchronized successfully" });
    } catch (error) {
      console.error('Error syncing schedules:', error);
      toast({ title: "Failed to sync schedules", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImport = () => {
    const fileInput = document.getElementById('import-file') as HTMLInputElement;
    fileInput?.click();
  };

  const handleExport = () => {
    if (teachers.length === 0) {
      toast({ title: "No teachers to export", variant: "destructive" });
      return;
    }

    const headers = ["Name", "Subject", "Post", "Contact Number"];
    const csvContent = [
      headers.join(','),
      ...teachers.map(teacher => [
        `"${teacher.name}"`,
        `"${teacher.subject}"`,
        `"${teacher.post}"`,
        `"${teacher.contactNumber}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Teachers data exported successfully" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (!event.target?.result) return;
          
          const csvData = event.target.result as string;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',');
          
          const teachersData = [];
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',').map(val => 
              val.startsWith('"') && val.endsWith('"') ? val.slice(1, -1) : val
            );
            
            if (values.length >= 4) {
              teachersData.push({
                name: values[0],
                subject: values[1],
                post: values[2],
                contactNumber: values[3],
                schedule: {}
              });
            }
          }
          
          for (const teacherData of teachersData) {
            const schedule: { [day: string]: { [period: string]: string } } = {};
            DAYS.forEach(day => {
              schedule[day] = {};
              periods.forEach(period => {
                schedule[day][period] = 'FREE';
              });
            });
            
            await saveTeacher({
              ...teacherData,
              schedule
            });
          }
          
          toast({ title: `Imported ${teachersData.length} teachers successfully` });
          loadTeachers();
        } catch (error) {
          console.error('Error importing teachers:', error);
          toast({ title: "Failed to import teachers", variant: "destructive" });
        } finally {
          e.target.value = '';
          setImportFile(null);
        }
      };
      
      reader.readAsText(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Staff Management</h2>
          <div className="flex items-center gap-2 mt-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total Teachers: {teachers.length}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSyncSchedules} 
            variant="outline"
            disabled={isSyncing}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Schedules
          </Button>
          <div className="flex gap-2">
            <input
              id="import-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button 
              onClick={handleImport} 
              variant="outline"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button 
              onClick={handleExport} 
              variant="outline"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PhotoUpload
                  value={formData.photo_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
                  label="Teacher Photo"
                  folderPrefix="teacher"
                />
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Teacher's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Subject taught"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="post">Post *</Label>
                  <Input
                    id="post"
                    value={formData.post}
                    onChange={(e) => setFormData({ ...formData, post: e.target.value })}
                    placeholder="Enter post (e.g., Principal, Teacher, etc.)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="Phone number"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingTeacher ? 'Update' : 'Add'} Teacher
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedule View Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Schedule for <NehaNameDisplay text={viewingScheduleTeacher?.name || ''} />
            </DialogTitle>
          </DialogHeader>
          {viewingScheduleTeacher && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Period</TableHead>
                    {DAYS.map(day => (
                      <TableHead key={day} className="text-center min-w-24">{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map(period => (
                    <TableRow key={period}>
                      <TableCell className="font-medium">{period}</TableCell>
                      {DAYS.map(day => {
                        const assignment = viewingScheduleTeacher.schedule?.[day]?.[period] || 'FREE';
                        return (
                          <TableCell key={`${day}-${period}`} className="text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              assignment === 'FREE' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              <NehaNameDisplay text={assignment} />
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => {
                    setIsScheduleDialogOpen(false);
                    setEditingScheduleTeacher(viewingScheduleTeacher);
                    setIsEditScheduleDialogOpen(true);
                  }}
                  className="ml-2"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Schedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Edit Dialog */}
      <Dialog open={isEditScheduleDialogOpen} onOpenChange={setIsEditScheduleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Schedule for <NehaNameDisplay text={editingScheduleTeacher?.name || ''} />
            </DialogTitle>
          </DialogHeader>
          {editingScheduleTeacher && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Period</TableHead>
                    {DAYS.map(day => (
                      <TableHead key={day} className="text-center min-w-24">{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map(period => (
                    <TableRow key={period}>
                      <TableCell className="font-medium">{period}</TableCell>
                      {DAYS.map(day => {
                        const assignment = editingScheduleTeacher.schedule?.[day]?.[period] || 'FREE';
                        return (
                          <TableCell key={`${day}-${period}`} className="p-1">
                            <Input
                              value={assignment}
                              onChange={(e) => handleScheduleChange(day, period, e.target.value)}
                              className="text-xs text-center h-8 py-1"
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditScheduleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveScheduleChanges}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Teachers List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {teachers.map((teacher, index) => (
              <div key={teacher.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {teacher.photo_url ? (
                      <img src={teacher.photo_url} alt={teacher.name} className="h-10 w-10 rounded-full object-cover border" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-base text-gray-500">
                        {teacher.name[0]}
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                      <h3 className="font-medium text-sm">
                        <NehaNameDisplay text={teacher.name} />
                      </h3>
                      <p className="text-xs text-gray-600">{teacher.subject}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewSchedule(teacher)}
                      className="h-8 w-8 p-0"
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(teacher)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(teacher.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Post:</span>
                    <span className="ml-1">{teacher.post}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 text-gray-500 mr-1" />
                    <span>{teacher.contactNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher, index) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                      {teacher.photo_url ? (
                        <img src={teacher.photo_url} alt={teacher.name} className="h-8 w-8 rounded-full object-cover border" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                          {teacher.name[0]}
                        </div>
                      )}
                      <NehaNameDisplay text={teacher.name} />
                    </TableCell>
                    <TableCell>{teacher.subject}</TableCell>
                    <TableCell>{teacher.post}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        {teacher.contactNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewSchedule(teacher)}
                          className="h-8 w-8 p-0"
                          title="View Schedule"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(teacher)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(teacher.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {teachers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No teachers found. Add your first teacher to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {teachers.length === 0 && (
            <div className="text-center text-gray-500 py-12 sm:hidden">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No teachers found</p>
              <p className="text-sm mt-2">Add your first teacher to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffModule;
