const fs = require('fs');
const dir = 'components/dashboard/crm/';
const files = [
  'CrmPipeline.tsx',
  'DealForm.tsx',
  'DealList.tsx',
  'DealListTable.tsx',
  'DealDetail.tsx',
  'EditDealModal.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(dir + f, 'utf8');
  content = content
    .replace(/type Lead /g, 'type Deal ')
    .replace(/interface Lead /g, 'interface Deal ')
    .replace(/Partial<Lead>/g, 'Partial<Deal>')
    .replace(/deals: Lead\[\]/g, 'deals: Deal[]')
    .replace(/deal: Lead /g, 'deal: Deal ')
    .replace(/deal: Lead \|/g, 'deal: Deal |')
    .replace(/deal: Lead;/g, 'deal: Deal;')
    .replace(/<Lead\[\]>/g, '<Deal[]>')
    .replace(/\/api\/leads/g, '/api/deals');
  fs.writeFileSync(dir + f, content);
});
