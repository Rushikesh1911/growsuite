const fs = require('fs');
const dir = 'components/dashboard/crm/';
const files = [
  'CrmPipeline.tsx',
  'DealForm.tsx',
  'DealList.tsx',
  'DealListTable.tsx',
  'DealDetail.tsx',
  'EditDealModal.tsx',
  'DealCard.tsx',
  'DealColumn.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(dir + f, 'utf8');
  content = content.replace(/import { Lead } from "\.\/types";/g, 'import { Deal } from "./types";');
  content = content.replace(/import { Lead, /g, 'import { Deal, ');
  
  if (f === 'DealCard.tsx' || f === 'DealColumn.tsx') {
    content = content
      .replace(/type Lead /g, 'type Deal ')
      .replace(/interface Lead /g, 'interface Deal ')
      .replace(/Partial<Lead>/g, 'Partial<Deal>')
      .replace(/deals: Lead\[\]/g, 'deals: Deal[]')
      .replace(/deal: Lead /g, 'deal: Deal ')
      .replace(/deal: Lead;/g, 'deal: Deal;')
      .replace(/deal: Lead \|/g, 'deal: Deal |')
      .replace(/deal: Lead,/g, 'deal: Deal,')
      .replace(/<Lead\[\]>/g, '<Deal[]>');
  }

  fs.writeFileSync(dir + f, content);
});
