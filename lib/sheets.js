// Google Sheets API integration
// Uses service account credentials from env vars

import { google } from 'googleapis';

let sheetsClient = null;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error('Missing Google service account credentials in environment variables');
  }

  return new google.auth.JWT(email, null, key, [
    'https://www.googleapis.com/auth/spreadsheets',
  ]);
}

function getSheets() {
  if (!sheetsClient) {
    const auth = getAuth();
    sheetsClient = google.sheets({ version: 'v4', auth });
  }
  return sheetsClient;
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Sheet1'; // adjust if needed

export async function fetchSheetData() {
  const sheets = getSheets();

  // Fetch a wide range to capture all date columns
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:ZZ200`,
  });

  const rows = res.data.values || [];
  if (rows.length < 5) {
    return { companies: [], dates: [], generalNotes: {}, actionItems: {} };
  }

  // Row 5 (index 4) is the header row
  const headerRow = rows[4] || [];
  // Date columns start at index 3 (column D onward)
  const dates = [];
  const dateColMap = {}; // date string → column index

  for (let i = 3; i < headerRow.length; i++) {
    const val = (headerRow[i] || '').trim();
    if (val) {
      dates.push(val);
      dateColMap[val] = i;
    }
  }

  // Rows 1-3 (index 0-2): general notes per date
  const generalNotes = {};
  for (const date of dates) {
    const col = dateColMap[date];
    const parts = [];
    for (let r = 0; r < 3; r++) {
      const cell = rows[r]?.[col] || '';
      if (cell.trim()) parts.push(cell.trim());
    }
    generalNotes[date] = parts.join('\n');
  }

  // Row 4 (index 3): action items per date
  const actionItems = {};
  for (const date of dates) {
    const col = dateColMap[date];
    actionItems[date] = rows[3]?.[col] || '';
  }

  // Rows 6+ (index 5+): companies
  const companies = [];
  const notes = {};

  // Initialize notes per date
  for (const date of dates) {
    notes[date] = {};
  }

  for (let r = 5; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[0]) continue;

    const name = (row[0] || '').trim();
    const analyst = (row[1] || '').trim();
    const partner = (row[2] || '').trim();

    companies.push({ name, analyst, partner });

    for (const date of dates) {
      const col = dateColMap[date];
      notes[date][name] = row[col] || '';
    }
  }

  return { companies, dates, notes, generalNotes, actionItems };
}

export async function syncToSheet({ date, notes, generalNotes, actionItems, companies }) {
  const sheets = getSheets();

  // First, fetch current headers to find or create the date column
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!1:5`,
  });

  const headerRows = headerRes.data.values || [];
  const headerRow = headerRows[4] || [];

  let dateCol = -1;
  for (let i = 3; i < headerRow.length; i++) {
    if ((headerRow[i] || '').trim() === date) {
      dateCol = i;
      break;
    }
  }

  // If date column doesn't exist, create it
  if (dateCol === -1) {
    dateCol = headerRow.length > 3 ? headerRow.length : 3;
  }

  const colLetter = columnToLetter(dateCol);

  // Build batch update data
  const data = [];

  // Header (row 5)
  data.push({
    range: `${SHEET_NAME}!${colLetter}5`,
    values: [[date]],
  });

  // General notes (rows 1-3)
  const gnLines = (generalNotes || '').split('\n');
  data.push({
    range: `${SHEET_NAME}!${colLetter}1:${colLetter}3`,
    values: [
      [gnLines[0] || ''],
      [gnLines[1] || ''],
      [gnLines[2] || ''],
    ],
  });

  // Action items (row 4)
  data.push({
    range: `${SHEET_NAME}!${colLetter}4`,
    values: [[actionItems || '']],
  });

  // Company notes (rows 6+)
  if (companies && notes) {
    for (let i = 0; i < companies.length; i++) {
      const name = companies[i].name;
      const noteText = notes[name] || '';
      const rowNum = i + 6; // row 6 is first company
      data.push({
        range: `${SHEET_NAME}!${colLetter}${rowNum}`,
        values: [[noteText]],
      });
    }
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data,
    },
  });

  return { success: true, updatedCells: data.length };
}

export async function addCompanyToSheet({ name, analyst, partner }) {
  const sheets = getSheets();

  // Insert a row at position 6 (index 5)
  // First, get the sheet's numeric ID
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetMeta = meta.data.sheets.find(
    (s) => s.properties.title === SHEET_NAME
  );
  const sheetId = sheetMeta?.properties?.sheetId || 0;

  // Insert row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: 5, // row 6 (0-indexed)
              endIndex: 6,
            },
            inheritFromBefore: false,
          },
        },
      ],
    },
  });

  // Write company info
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A6:C6`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[name, analyst, partner]],
    },
  });

  return { success: true };
}

function columnToLetter(col) {
  let letter = '';
  let c = col;
  while (c >= 0) {
    letter = String.fromCharCode((c % 26) + 65) + letter;
    c = Math.floor(c / 26) - 1;
  }
  return letter;
}
