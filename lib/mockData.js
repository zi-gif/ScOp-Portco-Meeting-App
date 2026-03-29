// Mock data representing what would come from Google Sheets API

export const TEAM_MEMBERS = ['Zi', 'Jeff', 'James', 'Mike', 'Kevin', 'Cormac', 'Drew', 'Ivan'];

export const LOGO_MAP = {};

export const MOCK_DATES = ['3/11', '3/18', '3/25'];

export const MOCK_COMPANIES = [
  { name: 'Pangram', analyst: 'Zi', partner: 'Jeff' },
  { name: 'Snag', analyst: 'Zi', partner: 'Mike' },
  { name: 'SuiteOp', analyst: 'James', partner: 'Jeff' },
  { name: 'Rogo', analyst: 'Kevin', partner: 'Jeff' },
  { name: 'Artiphishell', analyst: 'Jeff', partner: 'Mike' },
  { name: 'Spacture', analyst: 'Zi', partner: 'Jeff' },
  { name: 'Unwrap.ai', analyst: 'Drew', partner: 'Mike' },
  { name: 'ChipAgents', analyst: 'Cormac', partner: 'Jeff' },
  { name: 'PromptLayer', analyst: 'Ivan', partner: 'Mike' },
  { name: 'FLIP', analyst: 'Zi', partner: 'Jeff' },
  { name: 'BuyerCaddy', analyst: 'James', partner: 'Mike' },
  { name: 'HealthArc', analyst: 'Jeff', partner: 'Jeff' },
  { name: 'Yogi', analyst: 'Kevin', partner: 'Mike' },
  { name: 'Lifeguard', analyst: 'Zi', partner: 'Jeff' },
  { name: 'SmartBarrel', analyst: 'Cormac', partner: 'Mike' },
  { name: 'Guava', analyst: 'Drew', partner: 'Jeff' },
  { name: 'HeyTutor', analyst: 'James', partner: 'Mike' },
  { name: 'FoodReady', analyst: 'Ivan', partner: 'Jeff' },
  { name: 'Userpilot', analyst: 'Kevin', partner: 'Mike' },
  { name: 'Customers.ai', analyst: 'Zi', partner: 'Jeff' },
  { name: 'Rogo', analyst: 'Drew', partner: 'Mike' },
  { name: 'Designalytics', analyst: 'James', partner: 'Jeff' },
  { name: 'Tovuti', analyst: 'Cormac', partner: 'Mike' },
  { name: 'Cloverleaf', analyst: 'Ivan', partner: 'Jeff' },
  { name: 'Voyager', analyst: 'Kevin', partner: 'Mike' },
  { name: 'Aavenir', analyst: 'Zi', partner: 'Jeff' },
  { name: 'FreightPOP', analyst: 'Drew', partner: 'Mike' },
  { name: 'Pearly', analyst: 'James', partner: 'Jeff' },
];

// Mock notes keyed by date, then by company name
export const MOCK_NOTES = {
  '3/11': {
    'Pangram': 'New enterprise deal in pipeline. Zi to follow up with Alex on Friday.',
    'Snag': 'Series B prep underway. Revenue growing 15% MoM.',
    'SuiteOp': 'Launched new hotel module. James on customer intros.',
    'Artiphishell': 'Jeff to post blog about phishing detection product.',
    'HealthArc': 'Jeff on article. Exploring Medicare integrations.',
    'Lifeguard': 'Zi to get lifeguard email, contact Maya about partnership.',
    'FLIP': 'New hire starting next week. Burn rate stable.',
    'Guava': 'Drew check on hiring update from CEO.',
  },
  '3/18': {
    'Pangram': 'Enterprise deal moving forward. Demo with Fortune 500 scheduled.',
    'Snag': 'Board deck review needed before Series B. Mike to review.',
    'SuiteOp': 'Hotel module getting traction — 3 new pilots.',
    'Rogo': 'Launched new search features. Kevin to test and give feedback.',
    'Artiphishell': 'Blog posted. Good traction on LinkedIn.',
    'HealthArc': 'Medicare integration on track for Q2.',
    'Yogi': 'Kevin check on product roadmap update.',
    'BuyerCaddy': 'James meet with founders next Tuesday.',
    'Customers.ai': 'Zi on partnerships discussion with Larry.',
    'Pearly': 'James to coordinate dental network expansion outreach.',
  },
  '3/25': {
    'Pangram': 'Fortune 500 demo went well. Zi to call with Alex Friday, post article.',
    'Snag': 'Series B term sheet received. Reviewing with Mike.',
    'SuiteOp': '5 hotel pilots now, converting 2 to paid. James continue intros.',
    'Artiphishell': 'Jeff to post Artiphishell blog update on product launch.',
    'HealthArc': 'Jeff on article about Medicare progress.',
    'Lifeguard': 'Zi to get lifeguard email, contact Maya.',
    'Rogo': 'Search features getting good user feedback.',
    'ChipAgents': 'Cormac to sync with founding team on chip design pipeline.',
    'Userpilot': 'Kevin check on new onboarding flow metrics.',
  },
};

export const MOCK_GENERAL_NOTES = {
  '3/11': 'UCSB professor visiting Friday. ScOp swag order update — arriving next week.',
  '3/18': 'Analyst as Board Observers assignments finalized. Jeff traveling to NYC next week.',
  '3/25': 'Q1 review prep. Everyone submit portfolio updates by EOW. Drew presenting LP update draft.',
};

export const MOCK_ACTION_ITEMS = {
  '3/25': [
    { owner: 'Zi', action: 'Call with Alex Friday, post article', company: 'Pangram' },
    { owner: 'Zi', action: 'Get lifeguard email, contact Maya', company: 'Lifeguard' },
    { owner: 'Jeff', action: 'Post Artiphishell blog', company: 'Artiphishell' },
    { owner: 'Jeff', action: 'On article', company: 'HealthArc' },
    { owner: 'James', action: 'Continue intros', company: 'SuiteOp' },
    { owner: 'Mike', action: 'Review term sheet', company: 'Snag' },
    { owner: 'Kevin', action: 'Check on new onboarding flow metrics', company: 'Userpilot' },
    { owner: 'Cormac', action: 'Sync with founding team on chip design pipeline', company: 'ChipAgents' },
    { owner: 'Drew', action: 'Presenting LP update draft', company: '' },
    { owner: 'Everyone', action: 'Submit portfolio updates by EOW', company: '' },
  ],
};
