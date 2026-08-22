const fs = require('fs');
const files = [
  'frontend/components/dashboard/crm/ConvertDealModal.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/var\(--gs-muted-fg\)/g, 'var(--gs-muted)');
  fs.writeFileSync(file, content);
});
