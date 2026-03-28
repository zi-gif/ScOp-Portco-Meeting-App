// Action item parser — extracts action items from free-text notes
// Recognized patterns per PRD section 11

const KNOWN_NAMES = ['Zi', 'Jeff', 'James', 'Mike', 'Kevin', 'Cormac', 'Drew', 'Ivan', 'Everyone'];

const ACTION_VERBS = [
  'check', 'reach out', 'send', 'post', 'coordinate', 'continue',
  'meet', 'contact', 'write', 'talk', 'sync', 'pass', 'start',
  'get', 'download', 'review', 'follow up', 'call', 'schedule',
  'prepare', 'draft', 'present', 'submit', 'update', 'share',
];

export function parseActionItems(notes, companyName) {
  const items = [];
  if (!notes) return items;

  const sentences = notes.split(/[.;\n]+/).map(s => s.trim()).filter(Boolean);

  for (const sentence of sentences) {
    for (const name of KNOWN_NAMES) {
      // Pattern: "[Name] to [verb phrase]"
      const toPattern = new RegExp(`\\b${name}\\b\\s+to\\s+(.+)`, 'i');
      const toMatch = sentence.match(toPattern);
      if (toMatch) {
        items.push({
          owner: name,
          action: toMatch[1].trim().replace(/[.,;]+$/, ''),
          company: companyName,
        });
        continue;
      }

      // Pattern: "[Name] on [noun phrase]"
      const onPattern = new RegExp(`\\b${name}\\b\\s+on\\s+(.+)`, 'i');
      const onMatch = sentence.match(onPattern);
      if (onMatch) {
        items.push({
          owner: name,
          action: 'On ' + onMatch[1].trim().replace(/[.,;]+$/, ''),
          company: companyName,
        });
        continue;
      }

      // Pattern: "[Name] [action verb] [...]"
      for (const verb of ACTION_VERBS) {
        const verbPattern = new RegExp(`\\b${name}\\b\\s+(${verb}\\s+.+)`, 'i');
        const verbMatch = sentence.match(verbPattern);
        if (verbMatch) {
          items.push({
            owner: name,
            action: verbMatch[1].trim().replace(/[.,;]+$/, ''),
            company: companyName,
          });
          break;
        }
      }
    }
  }

  return items;
}

export function groupActionsByOwner(actionItems) {
  const grouped = {};
  const seen = new Set();

  for (const item of actionItems) {
    // Dedup by owner:action_prefix
    const prefix = item.action.toLowerCase().substring(0, 30);
    const key = `${item.owner}:${prefix}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (!grouped[item.owner]) {
      grouped[item.owner] = [];
    }
    grouped[item.owner].push(item);
  }

  return grouped;
}

export function formatForSlack(grouped) {
  let text = '';
  for (const [owner, items] of Object.entries(grouped)) {
    text += `*${owner}*\n`;
    for (const item of items) {
      const tag = item.company ? ` (${item.company})` : '';
      text += `- ${item.action}${tag}\n`;
    }
    text += '\n';
  }
  return text.trim();
}
