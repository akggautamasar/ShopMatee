
export const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.split('\n');
  const result: string[][] = [];
  
  for (const line of lines) {
    if (line.trim()) {
      const row = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      result.push(row);
    }
  }
  
  return result;
};

export const parseSubjectTeacher = (cellValue: string): { subject: string; teacher: string } => {
  // Handle format like "MATHS(PRIYA)" or "SCIENCE(SHILPA NEGI)"
  const match = cellValue.match(/^([^(]+)\(([^)]+)\)$/);
  if (match) {
    return {
      subject: match[1].trim(),
      teacher: match[2].trim()
    };
  }
  // Fallback for simple text
  return {
    subject: cellValue.trim(),
    teacher: ''
  };
};

export const downloadSampleTeacherCSV = () => {
  const headers = ['Name', 'Subject', 'Post', 'Contact Number'];
  const sampleData = [
    ['John Doe', 'Mathematics', 'Head Teacher', '9876543210'],
    ['Jane Smith', 'English', 'Senior Teacher', '9876543211'],
    ['Bob Wilson', 'Science', 'Assistant Teacher', '9876543212']
  ];
  
  const csvContent = [headers, ...sampleData]
    .map(row => row.join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-teachers.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadSampleTimetableCSV = () => {
  const headers = ['Class Name', 'Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'];
  const sampleData = [
    ['XI-A', 'ENGLISH(PRIYA RATHORE)', 'HINDI(POOJA)', 'MATHS(PRIYA)', 'SST(NEHA TIWARI)', 'SCIENCE(SHILPA NEGI)', 'MUSIC', 'SANSKRIT(C.B.)', 'COMPUTER(JUNAID RAFIQ)'],
    ['XI-B', 'HINDI(ARCHANA)', 'ENGLISH(NEHA)', 'ART(SUFIYA PARVEEN)', 'SCIENCE(SHILPA NEGI)', 'MATHS(PRIYA MISHRA)', 'SANSKRIT(NEHA TIWARI)', 'SANSKRIT(C.B.)', 'COMPUTER(JUNAID RAFIQ)'],
    ['XII-A', 'SANSKRIT(SOBIT SHARMA)', 'SST(AYUSHI)', 'ENGLISH(PRIYA RATHORE)', 'SCIENCE(SUKHDEV SINGH)', 'MATHS(LALITA)', 'HINDI(POOJA)', 'COMPUTER(JUNAID RAFIQ)', 'SST(NEHA TIWARI)']
  ];
  
  const csvContent = [headers, ...sampleData]
    .map(row => row.join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-timetable.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
