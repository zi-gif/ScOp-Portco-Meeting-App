'use client';

import { useState, useReducer, useEffect, useCallback, useRef } from 'react';
import {
  Search, Plus, User, Users, Clock, ChevronRight, ChevronDown,
  Save, Loader2, Check, X, Copy, CalendarPlus, AlertCircle,
} from 'lucide-react';
import { TEAM_MEMBERS, LOGO_MAP } from '@/lib/mockData';
import { parseActionItems, groupActionsByOwner, formatForSlack } from '@/lib/actionParser';

// ── Helpers ─────────────────────────────────────────────────────────
function getNextWednesday(lastDateStr) {
  // Parse "M/D" date string relative to current year
  const now = new Date();
  const year = now.getFullYear();
  const parts = lastDateStr.split('/');
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const last = new Date(year, month, day);

  const d = new Date(last);
  d.setDate(d.getDate() + 7); // next week
  // Adjust to Wednesday (3)
  while (d.getDay() !== 3) {
    d.setDate(d.getDate() + 1);
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getCompanyStatus(notes, prevNotes) {
  if (notes && notes.trim()) return 'green';
  if (prevNotes && prevNotes.trim()) return 'amber';
  return 'red';
}

// ── State Reducer ──────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'SELECT_DATE':
      return { ...state, activeDate: action.date };
    case 'SELECT_COMPANY':
      return { ...state, selectedCompany: action.index };
    case 'UPDATE_NOTE': {
      const newNotes = { ...state.notes };
      if (!newNotes[state.activeDate]) newNotes[state.activeDate] = {};
      newNotes[state.activeDate][action.company] = action.text;
      return { ...state, notes: newNotes, dirty: true };
    }
    case 'UPDATE_GENERAL_NOTES': {
      const newGeneral = { ...state.generalNotes };
      newGeneral[state.activeDate] = action.text;
      return { ...state, generalNotes: newGeneral, dirty: true };
    }
    case 'UPDATE_ARR': {
      const newCompanies = state.companies.map((c, i) =>
        i === action.index ? { ...c, arr: action.value } : c
      );
      return { ...state, companies: newCompanies, dirty: true };
    }
    case 'ADD_COMPANY': {
      const newCompanies = [action.company, ...state.companies];
      return { ...state, companies: newCompanies, selectedCompany: 0, dirty: true };
    }
    case 'NEW_WEEK': {
      const newDate = action.date;
      const newDates = [...state.dates, newDate];
      const newNotes = { ...state.notes, [newDate]: {} };
      const newGeneral = { ...state.generalNotes, [newDate]: '' };
      return {
        ...state,
        dates: newDates,
        notes: newNotes,
        generalNotes: newGeneral,
        activeDate: newDate,
        dirty: true,
      };
    }
    case 'SET_SAVING':
      return { ...state, saveState: action.saveState };
    case 'SET_ACTION_ITEMS':
      return { ...state, actionItems: action.items, showActionItems: true };
    case 'DISMISS_ACTION_ITEMS':
      return { ...state, showActionItems: false };
    case 'SET_DIRTY':
      return { ...state, dirty: action.dirty };
    default:
      return state;
  }
}

const initialState = {
  companies: [],
  dates: [],
  notes: {},
  generalNotes: {},
  actionItems: {},
  activeDate: '',
  selectedCompany: 0,
  loading: true,
  dirty: false,
  saveState: 'idle', // idle | saving | success
  showActionItems: false,
};

// ── Toast Component ──────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' ? <Check size={14} color="var(--green)" /> : <AlertCircle size={14} color="var(--red)" />}
      <span>{message}</span>
    </div>
  );
}

// ── Add Company Modal ────────────────────────────────────────────
function AddCompanyModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [analyst, setAnalyst] = useState(TEAM_MEMBERS[0]);
  const [partner, setPartner] = useState(TEAM_MEMBERS[1]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), analyst, partner });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.4px' }}>Add Company</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-40)' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>Company Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NewCo"
              autoFocus
            />
          </div>

          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>Analyst</label>
            <select value={analyst} onChange={(e) => setAnalyst(e.target.value)}>
              {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>Partner</label>
            <select value={partner} onChange={(e) => setPartner(e.target.value)}>
              {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              <Plus size={14} /> Add Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Action Items Floating Panel ──────────────────────────────────
function ActionItemsPanel({ actionItems, onDismiss }) {
  const grouped = groupActionsByOwner(actionItems);
  const owners = Object.keys(grouped);
  const [copied, setCopied] = useState(false);
  const totalItems = actionItems.length;

  function handleCopy() {
    const text = formatForSlack(grouped);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!owners.length) return null;

  return (
    <div style={styles.actionOverlay} onClick={onDismiss}>
      <div style={styles.actionPanel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.actionPanelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} color="var(--cream)" />
            <span style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.4px' }}>
              Action Items
            </span>
            <span style={{
              fontSize: '11px', color: 'var(--cream-60)', background: 'var(--cream-08)',
              padding: '2px 8px', marginLeft: '4px',
            }}>
              {totalItems}
            </span>
          </div>
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-40)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={styles.actionPanelBody}>
          <div style={styles.actionGrid}>
            {owners.map((owner) => (
              <div key={owner} style={styles.actionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{owner}</span>
                  <span style={{
                    fontSize: '11px', color: 'var(--cream-40)', background: 'var(--cream-08)',
                    padding: '2px 6px',
                  }}>
                    {grouped[owner].length}
                  </span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {grouped[owner].map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--cream-80)', lineHeight: '1.5' }}>
                      <span style={{ color: 'var(--cream-40)', marginRight: '6px' }}>–</span>
                      {item.action}
                      {item.company && (
                        <span style={{
                          fontSize: '10px', color: 'var(--muted)', marginLeft: '6px',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          ({item.company})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with copy button */}
        <div style={styles.actionPanelFooter}>
          <button
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
            onClick={handleCopy}
            style={{ padding: '10px 20px', fontSize: '13px', width: '100%', justifyContent: 'center' }}
          >
            {copied ? (
              <><Check size={14} /> Copied to Clipboard</>
            ) : (
              <><Copy size={14} /> Copy for Slack</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function MeetingPage() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [generalNotesOpen, setGeneralNotesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const noteRef = useRef(null);
  const companyListRef = useRef(null);

  // Load live data from Google Sheets on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/sheet');
        if (!res.ok) throw new Error('Failed to fetch sheet data');
        const data = await res.json();

        let { companies, dates, notes, generalNotes, actionItems } = data;

        // Auto-generate new Wednesday if needed
        if (dates.length > 0) {
          const lastDate = dates[dates.length - 1];
          const nextWed = getNextWednesday(lastDate);
          const now = new Date();
          const parts = nextWed.split('/');
          const nextWedDate = new Date(now.getFullYear(), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
          // If today is on or after that Wednesday and it doesn't exist yet
          if (now >= nextWedDate && !dates.includes(nextWed)) {
            dates = [...dates, nextWed];
            notes = { ...notes, [nextWed]: {} };
            generalNotes = { ...generalNotes, [nextWed]: '' };
          }
        }

        const activeDate = dates[dates.length - 1] || '';

        // Parse existing action items text from sheet (row 4) if present
        let parsedActions = [];
        const aiText = actionItems?.[activeDate];
        if (aiText && typeof aiText === 'string' && aiText.trim()) {
          // We have raw text from row 4 — display it as-is via the banner
          // Re-parse from notes instead for structured data
          for (const company of companies) {
            const note = notes[activeDate]?.[company.name];
            if (note) {
              const items = parseActionItems(note, company.name);
              parsedActions.push(...items);
            }
          }
        }

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            companies,
            dates,
            notes,
            generalNotes,
            actionItems: parsedActions,
            activeDate,
            selectedCompany: 0,
            showActionItems: parsedActions.length > 0,
          },
        });
      } catch (err) {
        console.error('Failed to load sheet data:', err);
        addToast('Failed to load data from Google Sheets', 'error');
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            companies: [],
            dates: [],
            notes: {},
            generalNotes: {},
            actionItems: [],
            activeDate: '',
            selectedCompany: 0,
          },
        });
      }
    }
    loadData();
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Derived data
  const {
    companies, dates, notes, generalNotes, actionItems,
    activeDate, selectedCompany, loading, saveState, showActionItems,
  } = state;

  const currentNotes = notes[activeDate] || {};
  const prevDateIndex = dates.indexOf(activeDate) - 1;
  const prevDate = prevDateIndex >= 0 ? dates[prevDateIndex] : null;
  const prevNotes = prevDate ? (notes[prevDate] || {}) : {};

  const filteredCompanies = companies.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.analyst.toLowerCase().includes(q) ||
      c.partner.toLowerCase().includes(q)
    );
  });

  const reviewedCount = companies.filter((c) => currentNotes[c.name]?.trim()).length;
  const pendingCount = companies.length - reviewedCount;
  const selectedCo = companies[selectedCompany] || null;

  // ── Save handler ──────────────────────────────────────
  async function handleSave() {
    dispatch({ type: 'SET_SAVING', saveState: 'saving' });

    try {
      // Parse action items from all notes
      const allActions = [];
      for (const company of companies) {
        const note = currentNotes[company.name];
        if (note) {
          const items = parseActionItems(note, company.name);
          allActions.push(...items);
        }
      }
      // Also parse general notes
      const generalItems = parseActionItems(generalNotes[activeDate] || '', '');
      allActions.push(...generalItems);

      // Format action items as plain text for row 4
      const grouped = groupActionsByOwner(allActions);
      const actionItemsText = formatForSlack(grouped);

      // Sync to Google Sheets
      const res = await fetch('/api/sheet/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: activeDate,
          notes: currentNotes,
          generalNotes: generalNotes[activeDate] || '',
          actionItems: actionItemsText,
          companies,
        }),
      });

      if (!res.ok) throw new Error('Sync failed');

      dispatch({ type: 'SET_ACTION_ITEMS', items: allActions });
      dispatch({ type: 'SET_SAVING', saveState: 'success' });
      dispatch({ type: 'SET_DIRTY', dirty: false });
      addToast('Notes saved & synced to Google Sheets');
    } catch (err) {
      console.error('Save error:', err);
      dispatch({ type: 'SET_SAVING', saveState: 'idle' });
      addToast('Failed to save — check console for details', 'error');
      return;
    }

    setTimeout(() => {
      dispatch({ type: 'SET_SAVING', saveState: 'idle' });
    }, 2000);
  }

  // ── New Week handler ──────────────────────────────────
  function handleNewWeek() {
    const lastDate = dates[dates.length - 1];
    const newDate = getNextWednesday(lastDate);
    dispatch({ type: 'NEW_WEEK', date: newDate });
    addToast(`New week created: ${newDate}`);
  }

  // ── Add company handler ───────────────────────────────
  async function handleAddCompany(company) {
    dispatch({ type: 'ADD_COMPANY', company });

    try {
      const res = await fetch('/api/sheet/add-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });
      if (!res.ok) throw new Error('Failed to add company');
      addToast('Company added to portfolio');
    } catch (err) {
      console.error('Add company error:', err);
      addToast('Company added locally — sheet sync failed', 'error');
    }
  }

  // Keyboard navigation: up/down arrows to switch companies
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentFilteredIdx = filteredCompanies.findIndex((c) => companies.indexOf(c) === selectedCompany);
        if (e.key === 'ArrowDown') {
          if (currentFilteredIdx < filteredCompanies.length - 1) {
            const nextCompany = filteredCompanies[currentFilteredIdx + 1];
            dispatch({ type: 'SELECT_COMPANY', index: companies.indexOf(nextCompany) });
          }
        } else if (e.key === 'ArrowUp') {
          if (currentFilteredIdx > 0) {
            const prevCompany = filteredCompanies[currentFilteredIdx - 1];
            dispatch({ type: 'SELECT_COMPANY', index: companies.indexOf(prevCompany) });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCompany, filteredCompanies, companies]);

  // Auto-scroll selected company into view
  useEffect(() => {
    if (companyListRef.current) {
      const rows = companyListRef.current.querySelectorAll('button');
      const idx = filteredCompanies.findIndex((c) => companies.indexOf(c) === selectedCompany);
      if (idx >= 0 && rows[idx]) {
        rows[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedCompany, filteredCompanies, companies]);

  // ── Loading screen ─────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src="https://scopvc.com/wp-content/uploads/2025/08/logo-1.png"
            alt="ScOp"
            style={{ height: '28px', filter: 'brightness(0) invert(0.94) sepia(0.08) saturate(0.3) hue-rotate(15deg)', marginBottom: '20px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cream-40)', fontSize: '13px' }}>
            <Loader2 size={14} className="spinner" /> Loading portfolio data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img
            src="https://scopvc.com/wp-content/uploads/2025/08/logo-1.png"
            alt="ScOp"
            style={{ height: '28px', filter: 'brightness(0) invert(0.94) sepia(0.08) saturate(0.3) hue-rotate(15deg)' }}
          />
          <div style={styles.headerDivider} />
          <span style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--cream-60)' }}>
            Portfolio Meeting
          </span>
        </div>

        <div style={styles.headerCenter}>
          <a
            href="https://scop-portfolio-db.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.databaseLink}
          >
            <span style={styles.databaseLinkDot} />
            Database
          </a>
        </div>

        <div style={styles.headerRight}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--cream-40)' }}>
              {reviewedCount}/{companies.length}
            </span>
            <div className="progress-bar-track" style={{ width: '80px' }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${companies.length ? (reviewedCount / companies.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <button
            className={`btn ${saveState === 'success' ? 'btn-success' : 'btn-primary'}`}
            onClick={handleSave}
            disabled={saveState === 'saving'}
            style={{ padding: '7px 16px' }}
          >
            {saveState === 'saving' ? (
              <><Loader2 size={14} className="spinner" /> Saving...</>
            ) : saveState === 'success' ? (
              <><Check size={14} /> Saved</>
            ) : (
              <><Save size={14} /> Save &amp; Sync</>
            )}
          </button>
        </div>
      </header>

      {/* ── DATE TABS ──────────────────────────────────────── */}
      <div style={styles.dateBar}>
        <div style={styles.dateTabs}>
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => dispatch({ type: 'SELECT_DATE', date })}
              style={{
                ...styles.dateTab,
                ...(date === activeDate ? styles.dateTabActive : {}),
              }}
            >
              {date}
            </button>
          ))}
        </div>
        <button
          className="btn btn-new-week"
          style={{ padding: '4px 10px', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}
          onClick={handleNewWeek}
        >
          <CalendarPlus size={12} /> New Week
        </button>
      </div>

      {/* ── GENERAL NOTES ──────────────────────────────────── */}
      <div style={styles.generalNotes}>
        <button
          onClick={() => setGeneralNotesOpen(!generalNotesOpen)}
          style={styles.generalNotesToggle}
        >
          {generalNotesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="section-label">General Notes · {activeDate}</span>
        </button>
        {generalNotesOpen && (
          <textarea
            value={generalNotes[activeDate] || ''}
            onChange={(e) => dispatch({ type: 'UPDATE_GENERAL_NOTES', text: e.target.value })}
            placeholder="Team-wide notes for this meeting..."
            rows={3}
            style={{ marginTop: '8px' }}
          />
        )}
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <div style={styles.mainContent}>
        {/* ── LEFT PANEL: Company List ──────────────────────── */}
        <div style={styles.leftPanel}>
          {/* Search */}
          <div style={styles.searchWrap}>
            <Search size={14} color="var(--cream-40)" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Add Company */}
          <button
            onClick={() => setShowAddModal(true)}
            style={styles.addCompanyBtn}
          >
            <Plus size={14} color="var(--cream-40)" /> Add Company
          </button>

          {/* Company list */}
          <div style={styles.companyList} ref={companyListRef}>
            {filteredCompanies.map((company, filteredIdx) => {
              const realIdx = companies.indexOf(company);
              const status = getCompanyStatus(
                currentNotes[company.name],
                prevNotes[company.name]
              );
              const isSelected = realIdx === selectedCompany;
              const preview = currentNotes[company.name] || '';

              return (
                <button
                  key={`${company.name}-${realIdx}`}
                  onClick={() => dispatch({ type: 'SELECT_COMPANY', index: realIdx })}
                  style={{
                    ...styles.companyItem,
                    ...(isSelected ? styles.companyItemSelected : {}),
                  }}
                >
                  <div style={styles.companyItemTop}>
                    <span style={styles.companyIndex}>
                      {String(realIdx + 1).padStart(2, '0')}
                    </span>
                    <div className={`status-dot ${status}`} />
                    <span style={styles.companyName}>{company.name}</span>
                  </div>
                  <div style={styles.companyMeta}>
                    <span style={styles.metaBadge}>
                      <User size={10} /> {company.analyst}
                    </span>
                    <span style={styles.metaBadge}>
                      <Users size={10} /> {company.partner}
                    </span>
                  </div>
                  {preview && (
                    <p style={styles.companyPreview}>
                      {preview.length > 80 ? preview.substring(0, 80) + '...' : preview}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={styles.listFooter}>
            <span>{companies.length} companies</span>
            <span>{pendingCount} pending</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: Company Detail ──────────────────── */}
        <div style={styles.rightPanel}>
          {selectedCo ? (
            <>
              {/* Header */}
              <div style={styles.detailHeader}>
                <div>
                  <h2 style={styles.detailName}>{selectedCo.name}</h2>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <span style={styles.detailBadge}>
                      <User size={12} /> {selectedCo.analyst}
                    </span>
                    <span style={styles.detailBadge}>
                      <Users size={12} /> {selectedCo.partner}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current ARR */}
              <div style={{ marginTop: '24px' }}>
                <label className="section-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Current ARR
                </label>
                <input
                  type="text"
                  value={selectedCo.arr || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_ARR', index: selectedCompany, value: e.target.value })}
                  placeholder="e.g. $2.5M"
                />
              </div>

              {/* This week's notes */}
              <div style={{ marginTop: '24px' }}>
                <label className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Clock size={12} /> This Week · {activeDate}
                </label>
                <textarea
                  ref={noteRef}
                  value={currentNotes[selectedCo.name] || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_NOTE', company: selectedCo.name, text: e.target.value })}
                  placeholder={`Notes for ${selectedCo.name}...`}
                  rows={6}
                />
              </div>

              {/* Previous week's notes */}
              {prevDate && prevNotes[selectedCo.name] && (
                <div style={{ marginTop: '20px' }}>
                  <label className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    Previous Week · {prevDate}
                  </label>
                  <div style={styles.prevNotes}>
                    {prevNotes[selectedCo.name]}
                  </div>
                </div>
              )}

              {/* Full History */}
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  style={styles.historyToggle}
                >
                  {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>Full History</span>
                </button>
                {historyOpen && (
                  <div style={styles.historyList}>
                    {[...dates].reverse().map((date) => {
                      const note = notes[date]?.[selectedCo.name];
                      if (!note) return null;
                      if (date === activeDate) return null;
                      return (
                        <div key={date} style={styles.historyItem}>
                          <span className="section-label" style={{ fontSize: '10px' }}>{date}</span>
                          <p style={{ fontSize: '13px', color: 'var(--cream-60)', marginTop: '4px', lineHeight: '1.5' }}>
                            {note}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--cream-20)', fontSize: '14px' }}>
              Select a company to view details
            </div>
          )}
        </div>
      </div>

      {/* ── ACTION ITEMS FLOATING PANEL ─────────────────────── */}
      {showActionItems && (
        <ActionItemsPanel
          actionItems={actionItems}
          onDismiss={() => dispatch({ type: 'DISMISS_ACTION_ITEMS' })}
        />
      )}

      {/* ── ADD COMPANY MODAL ──────────────────────────────── */}
      {showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCompany}
        />
      )}

      {/* ── TOASTS ─────────────────────────────────────────── */}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = {
  app: {
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--black)',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: '52px',
    background: 'var(--surface-1)',
    borderBottom: '1px solid var(--cream-08)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerDivider: {
    width: '1px',
    height: '20px',
    background: 'var(--cream-12)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
    justifyContent: 'flex-end',
  },
  databaseLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.02em',
    color: 'var(--cream)',
    textDecoration: 'none',
    padding: '6px 16px',
    border: '1px solid var(--cream-12)',
    borderRadius: '999px',
    background: 'transparent',
    transition: 'all 150ms ease',
    fontFamily: 'Outfit, sans-serif',
  },
  databaseLinkDot: {
    width: '8px',
    height: '8px',
    borderRadius: '999px',
    background: 'var(--green, #6fcf6f)',
    flexShrink: 0,
  },

  // Date bar
  dateBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    gap: '12px',
    height: '30px',
    background: 'var(--surface-1)',
    borderBottom: '1px solid var(--cream-08)',
    flexShrink: 0,
  },
  dateTabs: {
    display: 'flex',
    gap: '2px',
    overflow: 'auto',
    flex: 1,
    minWidth: 0,
  },
  dateTab: {
    background: 'none',
    border: 'none',
    color: 'var(--cream-40)',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 400,
    letterSpacing: '0.02em',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 150ms ease',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  dateTabActive: {
    color: 'var(--cream)',
    fontWeight: 500,
    borderBottomColor: 'var(--cream)',
  },

  // General notes
  generalNotes: {
    padding: '12px 20px',
    borderBottom: '1px solid var(--cream-08)',
    flexShrink: 0,
  },
  generalNotesToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--cream-60)',
    fontFamily: 'Outfit, sans-serif',
  },

  // Action items floating panel
  actionOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(6px)',
    zIndex: 950,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 150ms ease',
  },
  actionPanel: {
    background: 'var(--surface-1)',
    border: '1px solid var(--cream-12)',
    boxShadow: 'var(--shadow-lg)',
    width: '680px',
    maxWidth: '92vw',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'modalIn 200ms ease',
  },
  actionPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    borderBottom: '1px solid var(--cream-08)',
    flexShrink: 0,
  },
  actionPanelBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '18px 22px',
  },
  actionPanelFooter: {
    padding: '14px 22px',
    borderTop: '1px solid var(--cream-08)',
    flexShrink: 0,
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  actionCard: {
    background: 'var(--surface-2)',
    padding: '16px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--cream-08)',
  },

  // Main content
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  // Left panel
  leftPanel: {
    width: '280px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--cream-08)',
    overflow: 'hidden',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderBottom: '1px solid var(--cream-04)',
    background: 'var(--surface-1)',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    flex: 1,
    fontSize: '13px',
    padding: '4px 0',
    color: 'var(--cream)',
    fontFamily: 'Outfit, sans-serif',
    outline: 'none',
  },
  addCompanyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    margin: '8px 12px',
    background: 'transparent',
    border: '1px dashed var(--cream-12)',
    color: 'var(--cream-40)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 150ms ease',
  },
  companyList: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 0',
  },
  companyItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    borderLeft: '2px solid transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 150ms ease',
  },
  companyItemSelected: {
    borderLeftColor: 'var(--cream)',
    background: 'var(--cream-04)',
  },
  companyItemTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  companyIndex: {
    fontSize: '11px',
    color: 'var(--muted)',
    fontWeight: 400,
    width: '18px',
    flexShrink: 0,
  },
  companyName: {
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--cream)',
  },
  companyMeta: {
    display: 'flex',
    gap: '8px',
    marginLeft: '26px',
  },
  metaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: 'var(--muted)',
  },
  companyPreview: {
    fontSize: '12px',
    color: 'var(--cream-20)',
    marginLeft: '26px',
    lineHeight: '1.4',
    marginTop: '2px',
  },
  listFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 16px',
    fontSize: '11px',
    color: 'var(--muted)',
    borderTop: '1px solid var(--cream-08)',
    flexShrink: 0,
  },

  // Right panel
  rightPanel: {
    flex: 1,
    padding: '24px 32px',
    overflowY: 'auto',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailName: {
    fontSize: '24px',
    fontWeight: 600,
    letterSpacing: '-0.6px',
    color: 'var(--cream)',
  },
  detailBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: 'var(--cream-60)',
  },
  logoContainer: {
    width: '64px',
    height: '64px',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  logoPlaceholder: {
    width: '64px',
    height: '64px',
    background: 'var(--surface-2)',
    border: '1px solid var(--cream-20)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--cream-40)',
    flexShrink: 0,
  },
  prevNotes: {
    padding: '12px 14px',
    borderLeft: '2px solid var(--cream-12)',
    fontSize: '13px',
    color: 'var(--cream-40)',
    lineHeight: '1.6',
    background: 'var(--cream-04)',
  },
  historyToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--cream-40)',
    fontSize: '13px',
    fontFamily: 'Outfit, sans-serif',
    fontWeight: 500,
  },
  historyList: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingLeft: '20px',
    borderLeft: '1px solid var(--cream-08)',
  },
  historyItem: {
    paddingBottom: '12px',
    borderBottom: '1px solid var(--cream-04)',
  },
};
