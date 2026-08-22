export function downloadCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = "";
        
        // Escape quotes and wrap in quotes if contains comma, newline or quotes
        const strVal = String(val);
        if (strVal.includes(',') || strVal.includes('\n') || strVal.includes('"')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
