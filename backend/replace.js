const fs = require('fs');
const files = [
  'src/controllers/DealController.ts',
  'src/routes/deals.ts',
  'src/services/DealService.ts'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content
    .replace(/LeadStage/g, 'DealStage')
    .replace(/LeadService/g, 'DealService')
    .replace(/LeadController/g, 'DealController')
    .replace(/getLeads/g, 'getDeals')
    .replace(/createLead/g, 'createDeal')
    .replace(/updateLead/g, 'updateDeal')
    .replace(/convertLead/g, 'convertDeal')
    .replace(/leadId/g, 'dealId')
    .replace(/leads/g, 'deals')
    .replace(/lead\./g, 'deal.')
    .replace(/lead:/g, 'deal:')
    .replace(/lead /g, 'deal ')
    .replace(/ lead/g, ' deal')
    .replace(/Lead/g, 'Deal')
    .replace(/LEAD_/g, 'DEAL_');
  fs.writeFileSync(f, content);
});
