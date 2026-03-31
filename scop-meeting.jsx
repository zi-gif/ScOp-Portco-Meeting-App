import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, Save, ChevronDown, ChevronRight, ChevronUp, Copy, Check, Plus, X, Building2, User, Users, Clock, AlertTriangle, CheckCircle2, Circle, Loader2, ClipboardCheck, MessageSquare, CalendarDays, ArrowRight, CalendarPlus } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   LOGOS
   ═══════════════════════════════════════════════════════════ */
const SCOP_LOGO_LIGHT = "https://scopvc.com/wp-content/uploads/2025/08/logo.png";
const SCOP_LOGO_DARK = "https://scopvc.com/wp-content/uploads/2025/08/logo-1.png";

const COMPANY_LOGOS = {
  "Artiphishell": "https://scopvc.com/wp-content/uploads/2026/02/Artiphishell-logo-in-fish-form.png",
  "Spacture": "https://scopvc.com/wp-content/uploads/2025/12/6KY0n4QiOTlMJ1Eu9Qtg02O5Y5v1709733975133_200x200-modified.png",
  "Snag": "https://scopvc.com/wp-content/uploads/2025/06/Logo-15.png",
  "SuiteOp": "https://scopvc.com/wp-content/uploads/2025/06/Logo-10.png",
  "Pangram": "https://scopvc.com/wp-content/uploads/2025/06/Logo-68.png",
  "Unwrap.ai": "https://scopvc.com/wp-content/uploads/2025/06/Logo-16.png",
  "ChipAgents": "https://scopvc.com/wp-content/uploads/2025/06/ChipAgentsAi_logo__1_Logo-modified.jpg",
  "PromptLayer": "https://scopvc.com/wp-content/uploads/2025/06/Logo-69.png",
  "FLIP": "https://scopvc.com/wp-content/uploads/2025/06/Logo-21.png",
  "BuyerCaddy": "https://scopvc.com/wp-content/uploads/2025/06/Logo-31.png",
  "HealthArc": "https://scopvc.com/wp-content/uploads/2025/06/Logo-18.png",
  "Yogi": "https://scopvc.com/wp-content/uploads/2025/06/Logo-17.png",
  "Lifeguard": "https://scopvc.com/wp-content/uploads/2025/10/square-image-e1761587857929.jpg",
  "SmartBarrel": "https://scopvc.com/wp-content/uploads/2025/10/square-image-5-e1761587945159.jpg",
  "Guava": "https://scopvc.com/wp-content/uploads/2025/06/Logo-23.png",
  "HeyTutor": "https://scopvc.com/wp-content/uploads/2025/06/Logo-34.png",
  "FoodReady": "https://scopvc.com/wp-content/uploads/2025/06/Logo-19.png",
  "Userpilot": "https://scopvc.com/wp-content/uploads/2025/06/Logo-26.png",
  "Customers.ai": "https://scopvc.com/wp-content/uploads/2025/06/Logo-22.png",
  "Fewshot": null,
  "Rogo": "https://scopvc.com/wp-content/uploads/2025/06/Logo-13.png",
  "Designalytics": "https://scopvc.com/wp-content/uploads/2025/06/Logo-30.png",
  "Tovuti": "https://scopvc.com/wp-content/uploads/2025/06/Logo-24.png",
  "Cloverleaf": "https://scopvc.com/wp-content/uploads/2025/06/Logo-32.png",
  "Voyager": "https://scopvc.com/wp-content/uploads/2025/06/Logo-27.png",
  "Aavenir": "https://scopvc.com/wp-content/uploads/2025/06/Logo-28.png",
  "FreightPOP": "https://scopvc.com/wp-content/uploads/2025/06/Logo-29.png",
  "Pearly": "https://scopvc.com/wp-content/uploads/2025/06/Logo-14.png",
};

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */
const COMPANIES = [
  { name: "Artiphishell", analyst: "James", partner: "Cormac", notes: {"1/28":"Wired money, James done with memo", "2/4":"Drew on article, check in with James, 300k from DARPA on S&M", "2/11":"Jeff to post Artiphishell blog, Mike met Will, Cisco maybe interested 80k/yr, Potential office downtown", "2/18":"Demo 3/12", "3/4":"Demo Thursday in office", "3/11":"", "3/18":"", "3/25":""}},
  { name: "Spacture", analyst: "Jeff", partner: "Mike", notes: {"1/28":"Nazim visiting next Weds, Drew helped with finding AEs, wrote Blog", "2/4":"Tell Nazim no weed please, James to sync with Mike on outbound, Zi pass GTM analysis to Jeff after sharing with Nazim", "2/11":"No weed, James to pass off LP consultancy stuff", "2/18":"Got 25 EOY numbers, trying to hire salespeople", "3/4":"Flat last two months \"focused on hiring\", Competitor got into YC", "3/11":"Controversial video by an ex-CPO, flat quarter due to hiring, Jeff on going to Santa Barbara pharmacies", "3/18":"Board meeting in April", "3/25":"2 AE interviews, bad sales quarter, focus on product and hiring"}},
  { name: "Snag", analyst: "Zi", partner: "Mike", notes: {"1/28":"James sent line of credit, some offers coming in a couple weeks", "2/4":"Looking for better terms, burned 1.6M last year, Zi coordinate with Mike find ways to help, Cormac unit economics deep dive?", "2/11":"Zi check with Mike on support, operating efficiency and finding strategic investor (instead of debt), need LTM numbers", "2/18":"Shouldn't do debt", "3/4":"Mike met with them today, holding off on credit, focus on unit economics", "3/11":"Zi and Drew already sent a list of investors, priority is still unit econ", "3/18":"Board meeting", "3/25":"Finance Call"}},
  { name: "SuiteOp", analyst: "Jeff", partner: "Cormac", notes: {"1/28":"Board meeting next Tuesday, shared numbers", "2/4":"T wants to do a round (likely 12-15x multiple, at least 27 post), new AE sold 100k first month, ARR 1.2 live, 1.8 signed. aim for 3-6m ARR", "2/11":"", "2/18":"Have others invest first and we fill up the rest, ~600k between us and Luis, Cormac waiting for Luis", "3/4":"1.55M ARR, we are investing 425k", "3/11":"New sales person killing it 350k in 4 months, funding waiting on transferring some shares to the trust", "3/18":"", "3/25":"French Sam Walton potential SPV"}},
  { name: "Pangram", analyst: "Zi", partner: "Mike", notes: {"1/28":"Consumer at 460k ARR, Education 100-150k, API 100-150k. Kevin to reach out to Scale, Ridge, USV", "2/4":"Cormac meeting with Max next week, Zi start writing articles, focus on backlinks and marketing", "2/11":"Menlo (6 on 40 verbal, negotiating on 50 post, pro-rata?)", "2/18":"Got termsheet (6.5 on 45), no board seat (Cormac pressed, side letter says Max and Bradley vote). Kevin and Mike sync on board seat", "3/4":"10 at 45 post signed, Mike board observer, pro-rata or more (1.38% or more)", "3/11":"Deal mostly done, Lawyer has a minor issue (Menlo trying to take away our pro-rata for next round), waiting, Zi on potential analysis on consumer vs enterprise revenue", "3/18":"Signed waiting for money wire, deadline to wire: Mar 20th", "3/25":"Money wired, 1.2M consumer ARR? Directionally correct, need follow on check, Zi call with Alex Friday, post article"}},
  { name: "Unwrap.ai", analyst: "James", partner: "Mike", notes: {"1/28":"Help with hiring on LinkedIn, check token email", "2/4":"Cormac meeting new COO", "2/11":"Rory said raise Kingmaker round", "2/18":"", "3/4":"Invite Portcos to get set on Mid-march speaker event", "3/11":"", "3/18":"", "3/25":"Dennis Talk"}},
  { name: "ChipAgents", analyst: "Zi", partner: "Ivan", notes: {"1/28":"Matter is on our side, we own more than Matter, teaming up against BVP", "2/4":"Mike talked to a search firm, can potentially support with headhunting", "2/11":"", "2/18":"Zi to post on LinkedIn about new round", "3/4":"", "3/11":"7M ARR", "3/18":"", "3/25":""}},
  { name: "PromptLayer", analyst: "Jeff", partner: "Cormac", notes: {"1/28":"Want famous AI people for their podcast", "2/4":"Jeff on podcast list", "2/11":"Cormac meeting them Thursday, try to get 1M ARR by march. Jeff on article", "2/18":"", "3/4":"", "3/11":"Jeff on Article and using their platform", "3/18":"Jeff on article", "3/25":"New website, Jeff on article"}},
  { name: "FLIP", analyst: "Zi", partner: "Kevin", notes: {"1/28":"Help with hiring", "2/4":"Kevin having dinner and board meeting", "2/11":"Main issues: vertical vs horizontal", "2/18":"", "3/4":"", "3/11":"Kevin meeting them tomorrow", "3/18":"CRO candidates: Tyler Ferrier, WNBA Europe Player and Adam Zoucha", "3/25":"Kevin board meetings"}},
  { name: "BuyerCaddy", analyst: "James", partner: "Mike", notes: {"1/28":"Mike to contact Craig, Check Dan and Pawan", "2/4":"Meeting Thursday", "2/11":"Hold on until next Tuesday", "2/18":"Board meeting Friday", "3/4":"Dan Engel offered 12M round?", "3/11":"Not investing out of fund 2, but more debate next month", "3/18":"Waive the ROFR, planning to drop from board", "3/25":"Wait for board meeting, in a month"}},
  { name: "HealthArc", analyst: "Jeff", partner: "Kevin", notes: {"1/28":"Introduced to Nick Burman", "2/4":"Board meeting Friday", "2/11":"Mike spoke to Jack Whittaker, suggested talking to revgen. Jeff to help with list targeting, Mike checking in with Sudeep first", "2/18":"", "3/4":"Jeff on article", "3/11":"Jeff on Article, passed on strange round", "3/18":"Jeff on article", "3/25":"Jeff on article"}},
  { name: "Yogi", analyst: "Jeff", partner: "Ivan", notes: {"1/28":"", "2/4":"Cormac has audit stuff", "2/11":"Board meeting next Monday", "2/18":"", "3/4":"", "3/11":"", "3/18":"Jeff to reach out to Ivan to update", "3/25":"Jeff to reach out to Ivan to update, April 30th catchup"}},
  { name: "Lifeguard", analyst: "Zi", partner: "Cormac", notes: {"1/28":"Jeff on testing product and feedback", "2/4":"Launching a phone spam blocking app, Zi on partnership", "2/11":"Post Drew's article, Everyone download Lifeguard gather feedback, Zi talk to Austin Thursday", "2/18":"Zi talked to Austin, finding some partnership / ad targets: senior orgs, financial / insurance, telecom", "3/4":"Cormac meeting them this week", "3/11":"Zi continue on partnerships, GEO", "3/18":"Zi on partnerships, cold emailing, EVERYONE DOWNLOAD IT, \"I never get cold calls anymore\" Cormac Post", "3/25":"Zi get lifeguard email, contact Maya, Zi check with Cormac on list of potential investors"}},
  { name: "SmartBarrel", analyst: "James", partner: "Cormac", notes: {"1/28":"", "2/4":"Mike reached out to visit Miami, waiting to hear back", "2/11":"Meeting this Friday", "2/18":"Yana fired some guy and hired remote people, should build in-house", "3/4":"", "3/11":"", "3/18":"Everyone scared of Yana", "3/25":""}},
  { name: "Guava", analyst: "James", partner: "Kevin/Ivan", notes: {"1/28":"Dylan sent me: We don't send detailed metrics. ARR ~500,000", "2/4":"Kevin introduced Dylan to Google Corp Dev", "2/11":"Meeting with 2 corp dev and Google Health", "2/18":"", "3/4":"Met with Google, IT WENT WELL", "3/11":"", "3/18":"", "3/25":""}},
  { name: "HeyTutor", analyst: "Jeff", partner: "Cormac", notes: {"1/28":"", "2/4":"3.5M EBITDA", "2/11":"Jeff on Heytutor article", "2/18":"", "3/4":"Big meeting this morning on LAUSD settlement", "3/11":"Acquisition discussion Friday from Proximity Learning", "3/18":"New blog, major acquisition discussion", "3/25":"No update on acq yet"}},
  { name: "FoodReady", analyst: "James", partner: "Mike", notes: {"1/28":"", "2/4":"No to acquisition, need to figure out, new product out end Q1", "2/11":"", "2/18":"", "3/4":"350k cash, 20k MRR", "3/11":"2 back to back huge months (20k MRR)", "3/18":"", "3/25":"Gerry: 500k cash in the bank still"}},
  { name: "Userpilot", analyst: "James", partner: "Ivan", notes: {"1/28":"", "2/4":"Numbers out", "2/11":"", "2/18":"", "3/4":"James on article, James and Kevin on some article analysis stuff", "3/11":"", "3/18":"", "3/25":""}},
  { name: "Customers.ai", analyst: "Jeff", partner: "Kevin", notes: {"1/28":"", "2/4":"", "2/11":"New CFO, Chris Luciano", "2/18":"0 burn, new financial person", "3/4":"Building gong internally", "3/11":"", "3/18":"", "3/25":""}},
  { name: "Fewshot", analyst: "James", partner: "Ivan", notes: {"1/28":"", "2/4":"Terms of grant dictates everything has to be open-source for a year?", "2/11":"", "2/18":"James to send some papers re: reward hacking", "3/4":"", "3/11":"", "3/18":"", "3/25":""}},
  { name: "Rogo", analyst: "Zi", partner: "Mike/Kevin", notes: {"1/28":"Mike getting info from inside", "2/4":"Series C!!!", "2/11":"", "2/18":"", "3/4":"Sell?", "3/11":"750M secondaries", "3/18":"100M Projected", "3/25":""}},
  { name: "Designalytics", analyst: "Zi", partner: "Kevin", notes: {"1/28":"", "2/4":"", "2/11":"Profitable 6.5mm", "2/18":"", "3/4":"", "3/11":"Zi to reach out to Steve to ask where we can help", "3/18":"", "3/25":""}},
  { name: "Tovuti", analyst: "Jeff", partner: "Kevin", notes: {"1/28":"", "2/4":"", "2/11":"Jeff talked to Matt (new CEO), tough situation", "2/18":"", "3/4":"", "3/11":"", "3/18":"", "3/25":""}},
  { name: "Cloverleaf", analyst: "James", partner: "Kevin/Cormac", notes: {"1/28":"", "2/4":"", "2/11":"5% YoY", "2/18":"", "3/4":"", "3/11":"", "3/18":"", "3/25":""}},
  { name: "Voyager", analyst: "James", partner: "Ivan", notes: {"1/28":"", "2/4":"", "2/11":"", "2/18":"", "3/4":"", "3/11":"", "3/18":"", "3/25":""}},
  { name: "Aavenir", analyst: "Zi", partner: "Kevin", notes: {"1/28":"", "2/4":"", "2/11":"", "2/18":"", "3/4":"Auditors said we should mark this down, profitable last three months", "3/11":"", "3/18":"", "3/25":""}},
  { name: "FreightPOP", analyst: "Jeff", partner: "Kevin", notes: {"1/28":"", "2/4":"", "2/11":"", "2/18":"", "3/4":"", "3/11":"", "3/18":"", "3/25":""}},
  { name: "Pearly", analyst: "Zi", partner: "Cormac", notes: {"1/28":"", "2/4":"Cormac to reach out to Jeff", "2/11":"Cormac meeting with Jeff Thursday", "2/18":"", "3/4":"Joe Hsu joined as CEO, Jeff is done done", "3/11":"Hiring", "3/18":"", "3/25":""}}
];

const TEAM = ["Zi", "Jeff", "James", "Mike", "Kevin", "Cormac", "Drew", "Ivan"];
const DATES = ["1/28", "2/4", "2/11", "2/18", "3/4", "3/11", "3/18", "3/25"];
const DATE_LABELS = { "1/28":"Jan 28", "2/4":"Feb 4", "2/11":"Feb 11", "2/18":"Feb 18", "3/4":"Mar 4", "3/11":"Mar 11", "3/18":"Mar 18", "3/25":"Mar 25" };
const GENERAL_NOTES = {
  "1/28":"", "2/4":"", "2/11":"",
  "2/18":"UCSB professor Bu (Watermark) Visiting Friday\nWebsite company order revamp, AI companies first\nLocal Vibecoding competition, cooperation with Unwrap",
  "3/4":"", "3/11":"", "3/18":"", "3/25":""
};

/* ═══════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════ */
function getNextWednesday(lastDateStr) {
  // Parse last date like "3/25" and find the next Wednesday
  const year = 2026;
  const [month, day] = lastDateStr.split('/').map(Number);
  const last = new Date(year, month - 1, day);
  const next = new Date(last);
  next.setDate(next.getDate() + 7);
  return `${next.getMonth() + 1}/${next.getDate()}`;
}

function formatDateLabel(dateStr) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [month, day] = dateStr.split('/').map(Number);
  return `${months[month - 1]} ${day}`;
}

function extractActions(text, companyName) {
  if (!text) return [];
  const actions = [];
  const seen = new Set();
  const namePattern = '(?:Zi|Jeff|James|Mike|Kevin|Cormac|Drew|Ivan|Everyone)';
  const patterns = [
    new RegExp(`(${namePattern})\\s+to\\s+(.+?)(?:[,.]|$)`, 'gi'),
    new RegExp(`(${namePattern})\\s+on\\s+(.+?)(?:[,.]|$)`, 'gi'),
    new RegExp(`(${namePattern})\\s+(check|reach out|send|post|get|contact|coordinate|continue|start|pass|meet|write|talk|sync|introduce|download)\\s+(.+?)(?:[,.]|$)`, 'gi'),
  ];
  patterns.forEach((pattern, pi) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const owner = match[1].trim();
      const action = pi === 2 ? (match[2] + ' ' + match[3]).trim() : match[2].trim();
      const clean = action.replace(/^(to|on)\s+/i, '');
      const key = `${owner}:${clean.toLowerCase().slice(0, 40)}`;
      if (!seen.has(key) && clean.length > 2) {
        seen.add(key);
        actions.push({ owner, action: clean.charAt(0).toUpperCase() + clean.slice(1), company: companyName });
      }
    }
  });
  return actions;
}

function getStatus(company, currentDate, allDates) {
  const idx = allDates.indexOf(currentDate);
  const current = (company.notes[currentDate] || '').trim();
  if (current) return 'updated';
  if (idx > 0 && (company.notes[allDates[idx - 1]] || '').trim()) return 'stale';
  let lastUpdate = -1;
  for (let i = idx; i >= 0; i--) {
    if ((company.notes[allDates[i]] || '').trim()) { lastUpdate = i; break; }
  }
  if (lastUpdate === -1 || idx - lastUpdate >= 2) return 'inactive';
  return 'stale';
}

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  /* ── Core palette from scopvc.com ── */
  --black: #000000;
  --surface-1: #0a0a0a;
  --surface-2: #131313;
  --surface-3: #1a1a1a;
  --surface-hover: #1f1f1f;
  --surface-pressed: #0d0d0d;
  --cream: #f3f0e7;
  --cream-80: rgba(243, 240, 231, 0.80);
  --cream-60: rgba(243, 240, 231, 0.60);
  --cream-40: rgba(243, 240, 231, 0.40);
  --cream-20: rgba(243, 240, 231, 0.20);
  --cream-12: rgba(243, 240, 231, 0.12);
  --cream-08: rgba(243, 240, 231, 0.08);
  --cream-04: rgba(243, 240, 231, 0.04);
  --muted: rgb(104, 109, 109);

  /* ── Semantic colors ── */
  --green: #6fcf6f;
  --green-dim: rgba(111, 207, 111, 0.15);
  --amber: #e0ad3a;
  --amber-dim: rgba(224, 173, 58, 0.15);
  --red: #e06060;
  --red-dim: rgba(224, 96, 96, 0.15);

  /* ── Shadows for dark mode depth ── */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 0 1px var(--cream-08), 0 4px 20px rgba(0,0,0,0.6);

  /* ── Typography — Outfit matches Aktiv Grotesk's geometric feel ── */
  --font: 'Outfit', system-ui, -apple-system, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #root { height: 100%; overflow: hidden; }

body {
  background: var(--black);
  color: var(--cream);
  font-family: var(--font);
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ═══════════ APP SHELL ═══════════ */
.app { display: flex; flex-direction: column; height: 100vh; }

/* ═══════════ HEADER ═══════════ */
.header {
  height: 56px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--cream-08);
  background: var(--surface-1);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.header-left { display: flex; align-items: center; gap: 20px; }

.logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 28px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(0.94) sepia(0.08) saturate(0.3) hue-rotate(15deg);
}

.header-sep {
  width: 1px;
  height: 20px;
  background: var(--cream-12);
}

.header-meeting {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--cream-60);
  font-weight: 400;
}

.header-meeting svg { opacity: 0.5; }

.header-right { display: flex; align-items: center; gap: 16px; }

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-label {
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
  white-space: nowrap;
}

.progress-bar {
  width: 100px;
  height: 3px;
  background: var(--cream-08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--green);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  height: 34px;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  white-space: nowrap;
}

.btn svg { width: 15px; height: 15px; }

/* Primary: cream bg, black text — matches ScOp button style */
.btn-primary {
  background: var(--cream);
  color: var(--black);
}
.btn-primary:hover { background: #fff; }
.btn-primary:active { background: #ddd8cc; transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
.btn-primary:disabled:hover { background: var(--cream); }

/* Ghost: transparent, cream text */
.btn-ghost {
  background: transparent;
  color: var(--cream-60);
  border: 1px solid var(--cream-12);
}
.btn-ghost:hover { background: var(--cream-08); color: var(--cream-80); border-color: var(--cream-20); }
.btn-ghost:active { background: var(--cream-04); transform: scale(0.98); }

/* Success: green tint after save */
.btn-success {
  background: var(--green);
  color: var(--black);
}

/* ═══════════ DATE BAR ═══════════ */
.date-bar {
  height: 44px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 2px;
  border-bottom: 1px solid var(--cream-08);
  background: var(--surface-1);
  flex-shrink: 0;
  overflow-x: auto;
}

.date-tab {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font);
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  letter-spacing: -0.01em;
  position: relative;
}

.date-tab:hover { color: var(--cream-80); }

.date-tab.active {
  color: var(--cream);
}

.date-tab.active::after {
  content: '';
  position: absolute;
  bottom: -7px;
  left: 14px;
  right: 14px;
  height: 1px;
  background: var(--cream);
}

/* ═══════════ GENERAL NOTES ═══════════ */
.general-notes {
  border-bottom: 1px solid var(--cream-08);
  background: var(--surface-1);
  flex-shrink: 0;
  transition: max-height 0.3s ease;
  overflow: hidden;
}

.general-notes-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 28px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  color: var(--cream-60);
  transition: color 0.15s ease;
}

.general-notes-toggle:hover { color: var(--cream-80); }

.general-notes-toggle-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.general-notes-toggle-left svg { width: 14px; height: 14px; }

.general-textarea {
  width: calc(100% - 56px);
  margin: 0 28px 12px;
  min-height: 64px;
  padding: 10px 14px;
  font-size: 13px;
  font-family: var(--font);
  font-weight: 400;
  line-height: 1.6;
  color: var(--cream);
  background: var(--surface-2);
  border: 1px solid var(--cream-08);
  outline: none;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.general-textarea:hover { border-color: var(--cream-12); }
.general-textarea:focus { border-color: var(--cream-20); box-shadow: 0 0 0 1px var(--cream-08); }
.general-textarea::placeholder { color: var(--muted); }

/* ═══════════ ACTION ITEMS BANNER ═══════════ */
.actions-banner {
  background: var(--surface-2);
  border-bottom: 1px solid var(--cream-12);
  padding: 20px 28px;
  flex-shrink: 0;
  animation: slideDown 0.3s ease;
  max-height: 300px;
  overflow-y: auto;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); max-height: 0; padding: 0 28px; }
  to { opacity: 1; transform: translateY(0); }
}

.actions-banner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.actions-banner-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--cream);
}

.actions-banner-title svg { color: var(--green); }

.actions-banner-actions {
  display: flex;
  gap: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.actions-person {
  background: var(--surface-3);
  padding: 14px 16px;
  border: 1px solid var(--cream-08);
  box-shadow: var(--shadow-sm);
}

.actions-person-name {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--cream);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-person-count {
  font-size: 11px;
  font-weight: 400;
  color: var(--muted);
}

.actions-person-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  color: var(--cream-80);
  line-height: 1.4;
}

.actions-person-item svg {
  width: 12px;
  height: 12px;
  margin-top: 3px;
  color: var(--cream-20);
  flex-shrink: 0;
}

.actions-company-tag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  margin-left: 4px;
}

/* ═══════════ MAIN LAYOUT ═══════════ */
.main { display: flex; flex: 1; min-height: 0; }

/* ═══════════ LEFT PANEL ═══════════ */
.panel-left {
  width: 380px;
  min-width: 380px;
  border-right: 1px solid var(--cream-08);
  display: flex;
  flex-direction: column;
  background: var(--black);
}

.search-wrap {
  padding: 12px 20px;
  border-bottom: 1px solid var(--cream-08);
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrap svg { color: var(--muted); width: 16px; height: 16px; flex-shrink: 0; }

.search-input {
  flex: 1;
  padding: 0;
  font-size: 13px;
  font-family: var(--font);
  font-weight: 400;
  background: none;
  border: none;
  color: var(--cream);
  outline: none;
}

.search-input::placeholder { color: var(--muted); }

.add-btn-wrap {
  padding: 10px 20px;
  border-bottom: 1px solid var(--cream-08);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 0;
  font-family: var(--font);
  font-size: 12px;
  font-weight: 500;
  color: var(--cream-60);
  background: var(--cream-04);
  border: 1px dashed var(--cream-12);
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.01em;
}

.add-btn:hover { background: var(--cream-08); color: var(--cream-80); border-color: var(--cream-20); }
.add-btn:active { background: var(--cream-04); }
.add-btn svg { width: 14px; height: 14px; }

/* ── Company List ── */
.company-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--cream-08) transparent;
}
.company-list::-webkit-scrollbar { width: 5px; }
.company-list::-webkit-scrollbar-track { background: transparent; }
.company-list::-webkit-scrollbar-thumb { background: var(--cream-08); }
.company-list::-webkit-scrollbar-thumb:hover { background: var(--cream-12); }

.company-row {
  padding: 12px 20px;
  border-bottom: 1px solid var(--cream-04);
  cursor: pointer;
  transition: background 0.12s ease;
  animation: fadeUp 0.25s ease both;
  position: relative;
}

.company-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: transparent;
  transition: background 0.15s ease;
}

.company-row:hover { background: var(--cream-04); }
.company-row.selected { background: var(--cream-08); }
.company-row.selected::before { background: var(--cream); }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.company-row-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 3px;
}

.company-status {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.company-status.updated { background: var(--green); box-shadow: 0 0 6px var(--green-dim); }
.company-status.stale { background: var(--amber); }
.company-status.inactive { background: var(--red); opacity: 0.5; }

.company-name {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--cream);
  flex: 1;
}

.company-index {
  font-size: 10px;
  color: var(--cream-20);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.company-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  margin-left: 17px;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--muted);
  font-weight: 400;
}

.meta-badge svg { width: 10px; height: 10px; opacity: 0.5; }

.meta-sep { color: var(--cream-12); font-size: 10px; margin: 0 2px; }

.company-preview {
  font-size: 12px;
  color: var(--cream-40);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 17px;
}

.list-footer {
  padding: 10px 20px;
  border-top: 1px solid var(--cream-08);
  font-size: 11px;
  color: var(--muted);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ═══════════ RIGHT PANEL ═══════════ */
.panel-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--black);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--muted);
  font-size: 14px;
}

.empty-state svg { width: 32px; height: 32px; opacity: 0.3; }

.detail-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--cream-08) transparent;
}
.detail-scroll::-webkit-scrollbar { width: 5px; }
.detail-scroll::-webkit-scrollbar-track { background: transparent; }
.detail-scroll::-webkit-scrollbar-thumb { background: var(--cream-08); }

/* ── Detail Header ── */
.detail-header {
  padding: 28px 40px 24px;
  border-bottom: 1px solid var(--cream-08);
}

.detail-name {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.8px;
  color: var(--cream);
  margin-bottom: 10px;
}

.detail-badges {
  display: flex;
  gap: 20px;
}

/* ── New Week Button ── */
.new-week-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-family: var(--font);
  font-size: 11px;
  font-weight: 500;
  color: var(--green);
  background: var(--green-dim);
  border: 1px solid rgba(111, 207, 111, 0.2);
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.new-week-btn:hover { background: rgba(111, 207, 111, 0.25); border-color: rgba(111, 207, 111, 0.35); }
.new-week-btn:active { transform: scale(0.97); }
.new-week-btn svg { width: 13px; height: 13px; }

.detail-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  color: var(--cream-60);
}

.detail-badge svg { width: 14px; height: 14px; opacity: 0.4; }
.detail-badge strong { font-weight: 500; color: var(--cream); }

/* ── Note Section ── */
.section {
  padding: 24px 40px;
  border-bottom: 1px solid var(--cream-08);
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.section-label svg { width: 14px; height: 14px; opacity: 0.5; }

.note-textarea {
  width: 100%;
  min-height: 140px;
  padding: 14px 16px;
  font-size: 16px;
  font-family: var(--font);
  font-weight: 400;
  line-height: 1.65;
  letter-spacing: -0.01em;
  color: var(--cream);
  background: var(--surface-2);
  border: 1px solid var(--cream-08);
  outline: none;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.note-textarea:hover { border-color: var(--cream-12); }
.note-textarea:focus { border-color: var(--cream-20); box-shadow: 0 0 0 1px var(--cream-08); }
.note-textarea::placeholder { color: var(--muted); }

.prev-note {
  font-size: 15px;
  line-height: 1.6;
  color: var(--cream-60);
  padding: 14px 16px;
  background: var(--surface-2);
  border-left: 2px solid var(--cream-12);
}

.prev-note.empty { color: var(--muted); font-style: italic; }

/* ── History ── */
.history-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 500;
  color: var(--cream-60);
  cursor: pointer;
  background: none;
  border: none;
  font-family: var(--font);
  transition: color 0.15s ease;
  padding: 0;
}

.history-toggle:hover { color: var(--cream); }
.history-toggle svg { width: 13px; height: 13px; transition: transform 0.15s ease; }

.history-entries { margin-top: 14px; animation: fadeUp 0.2s ease both; }

.history-entry { padding: 10px 0; border-top: 1px solid var(--cream-04); }
.history-date { font-size: 11px; font-weight: 600; color: var(--muted); margin-bottom: 3px; }
.history-text { font-size: 15px; color: var(--cream-60); line-height: 1.5; }
.history-text.empty { color: var(--cream-20); font-style: italic; }

/* ═══════════ ADD COMPANY MODAL ═══════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal {
  background: var(--surface-2);
  border: 1px solid var(--cream-12);
  box-shadow: var(--shadow-lg);
  width: 400px;
  padding: 28px;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  margin-bottom: 20px;
  color: var(--cream);
}

.modal-field { margin-bottom: 14px; }

.modal-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 6px;
}

.modal-input, .modal-select {
  width: 100%;
  padding: 8px 12px;
  font-family: var(--font);
  font-size: 13px;
  color: var(--cream);
  background: var(--surface-3);
  border: 1px solid var(--cream-12);
  outline: none;
  transition: border-color 0.15s ease;
}

.modal-input:focus, .modal-select:focus { border-color: var(--cream-20); }
.modal-input::placeholder { color: var(--muted); }

.modal-select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23686d6d' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}

.modal-select option { background: var(--surface-3); color: var(--cream); }

.modal-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* ═══════════ TOAST ═══════════ */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  background: var(--surface-3);
  border: 1px solid var(--cream-12);
  box-shadow: var(--shadow-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--cream);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 200;
  animation: toastIn 0.25s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.toast svg { width: 16px; height: 16px; }
.toast.success svg { color: var(--green); }

/* ═══════════ LOADING SPINNER ═══════════ */
.spinner { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function ScOpMeeting() {
  const [companies, setCompanies] = useState(COMPANIES);
  const [dates, setDates] = useState(DATES);
  const [dateLabels, setDateLabels] = useState(DATE_LABELS);
  const [generalNotes, setGeneralNotes] = useState(GENERAL_NOTES);
  const [currentDate, setCurrentDate] = useState("3/25");
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [search, setSearch] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [generalOpen, setGeneralOpen] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', analyst: 'Zi', partner: 'Cormac' });
  const textareaRef = useRef(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return companies.map((c, i) => ({ ...c, _idx: i }));
    const q = search.toLowerCase();
    return companies
      .map((c, i) => ({ ...c, _idx: i }))
      .filter(c => c.name.toLowerCase().includes(q) || c.analyst.toLowerCase().includes(q) || c.partner.toLowerCase().includes(q));
  }, [companies, search]);

  const selected = selectedIdx !== null ? companies[selectedIdx] : null;
  const prevDate = dates[dates.indexOf(currentDate) - 1] || null;

  const reviewedCount = useMemo(() =>
    companies.filter(c => (c.notes[currentDate] || '').trim()).length,
  [companies, currentDate]);

  const allActions = useMemo(() => {
    const byTeam = {};
    TEAM.forEach(t => { byTeam[t] = []; });
    companies.forEach(c => {
      const actions = extractActions(c.notes[currentDate] || '', c.name);
      actions.forEach(a => {
        if (byTeam[a.owner]) byTeam[a.owner].push(a);
      });
    });
    return byTeam;
  }, [companies, currentDate, showActions]);

  const totalActions = useMemo(() =>
    Object.values(allActions).reduce((s, a) => s + a.length, 0),
  [allActions]);

  const updateNote = useCallback((text) => {
    if (selectedIdx === null) return;
    setCompanies(prev => prev.map((c, i) =>
      i === selectedIdx ? { ...c, notes: { ...c.notes, [currentDate]: text } } : c
    ));
  }, [selectedIdx, currentDate]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setShowActions(true);
    setSaving(false);
    setToast('saved');
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCopy = useCallback(() => {
    let text = '';
    TEAM.forEach(member => {
      const items = allActions[member] || [];
      if (items.length > 0) {
        text += `*${member}*\n`;
        items.forEach(a => { text += `- ${a.action} (${a.company})\n`; });
        text += '\n';
      }
    });
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [allActions]);

  const handleNewWeek = useCallback(() => {
    const lastDate = dates[dates.length - 1];
    const newDate = getNextWednesday(lastDate);
    const newLabel = formatDateLabel(newDate);
    setDates(prev => [...prev, newDate]);
    setDateLabels(prev => ({ ...prev, [newDate]: newLabel }));
    setGeneralNotes(prev => ({ ...prev, [newDate]: '' }));
    setCompanies(prev => prev.map(c => ({ ...c, notes: { ...c.notes, [newDate]: '' } })));
    setCurrentDate(newDate);
    setShowActions(false);
    setToast('newweek');
    setTimeout(() => setToast(null), 3000);
  }, [dates]);

  const handleAddCompany = useCallback(() => {
    if (!newCompany.name.trim()) return;
    const fresh = {
      name: newCompany.name.trim(),
      analyst: newCompany.analyst,
      partner: newCompany.partner,
      notes: dates.reduce((acc, d) => ({ ...acc, [d]: '' }), {})
    };
    setCompanies(prev => [fresh, ...prev]);
    setShowAddModal(false);
    setNewCompany({ name: '', analyst: 'Zi', partner: 'Cormac' });
    setSelectedIdx(0);
    setToast('added');
    setTimeout(() => setToast(null), 3000);
  }, [newCompany, dates]);

  useEffect(() => {
    if (textareaRef.current && selected) {
      textareaRef.current.value = selected.notes[currentDate] || '';
    }
  }, [selectedIdx, currentDate, selected]);

  useEffect(() => { setHistoryOpen(false); }, [selectedIdx]);

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* ═══ HEADER ═══ */}
        <div className="header">
          <div className="header-left">
            <div className="logo">
              <img src={SCOP_LOGO_DARK} alt="ScOp Venture Capital" className="logo-img" />
            </div>
            <div className="header-sep" />
            <div className="header-meeting">
              <CalendarDays size={14} />
              Portfolio Meeting
            </div>
          </div>
          <div className="header-right">
            <div className="progress-wrap">
              <span className="progress-label">{reviewedCount}/{companies.length} reviewed</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(reviewedCount / companies.length) * 100}%` }} />
              </div>
            </div>
            <button
              className={`btn ${saving ? 'btn-ghost' : toast === 'saved' ? 'btn-success' : 'btn-primary'}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 size={15} className="spinner" /> : toast === 'saved' ? <Check size={15} /> : <Save size={15} />}
              {saving ? 'Saving...' : toast === 'saved' ? 'Saved' : 'Save & Sync'}
            </button>
          </div>
        </div>

        {/* ═══ DATE TABS ═══ */}
        <div className="date-bar">
          {dates.map(d => (
            <button key={d} className={`date-tab ${d === currentDate ? 'active' : ''}`} onClick={() => { setCurrentDate(d); setShowActions(false); }}>
              {dateLabels[d] || d}
            </button>
          ))}
          <button className="new-week-btn" onClick={handleNewWeek} style={{ marginLeft: 8 }}>
            <CalendarPlus /> New Week
          </button>
        </div>

        {/* ═══ GENERAL NOTES ═══ */}
        <div className="general-notes">
          <button className="general-notes-toggle" onClick={() => setGeneralOpen(!generalOpen)}>
            <span className="general-notes-toggle-left">
              <MessageSquare size={14} />
              General Notes &middot; {dateLabels[currentDate] || currentDate}
            </span>
            {generalOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {generalOpen && (
            <textarea
              className="general-textarea"
              value={generalNotes[currentDate] || ''}
              onChange={e => setGeneralNotes(prev => ({ ...prev, [currentDate]: e.target.value }))}
              placeholder="Team-wide notes for this meeting..."
            />
          )}
        </div>

        {/* ═══ ACTION ITEMS BANNER (after Save) ═══ */}
        {showActions && totalActions > 0 && (
          <div className="actions-banner">
            <div className="actions-banner-header">
              <div className="actions-banner-title">
                <ClipboardCheck size={16} />
                Action Items &middot; {dateLabels[currentDate] || currentDate}
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>
                  {totalActions} items
                </span>
              </div>
              <div className="actions-banner-actions">
                <button className="btn btn-ghost" onClick={handleCopy} style={{ height: 30, fontSize: 12 }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy for Slack'}
                </button>
                <button className="btn btn-ghost" onClick={() => setShowActions(false)} style={{ height: 30, padding: '0 8px' }}>
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="actions-grid">
              {TEAM.map(member => {
                const items = allActions[member] || [];
                if (items.length === 0) return null;
                return (
                  <div key={member} className="actions-person">
                    <div className="actions-person-name">
                      {member}
                      <span className="actions-person-count">{items.length}</span>
                    </div>
                    {items.map((a, i) => (
                      <div key={i} className="actions-person-item">
                        <ArrowRight />
                        <span>{a.action}<span className="actions-company-tag">{a.company}</span></span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ MAIN ═══ */}
        <div className="main">
          {/* ── Left Panel ── */}
          <div className="panel-left">
            <div className="search-wrap">
              <Search />
              <input
                className="search-input"
                placeholder="Search companies, analysts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="add-btn-wrap">
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                <Plus /> Add Company
              </button>
            </div>
            <div className="company-list">
              {filtered.map((c, fi) => {
                const status = getStatus(c, currentDate, dates);
                const preview = (c.notes[currentDate] || '').trim();
                return (
                  <div
                    key={c.name}
                    className={`company-row ${c._idx === selectedIdx ? 'selected' : ''}`}
                    style={{ animationDelay: `${fi * 15}ms` }}
                    onClick={() => setSelectedIdx(c._idx)}
                  >
                    <div className="company-row-top">
                      <span className={`company-status ${status}`} />
                      <span className="company-name">{c.name}</span>
                      <span className="company-index">{String(fi + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="company-meta">
                      <span className="meta-badge"><User size={10} />{c.analyst}</span>
                      <span className="meta-sep">/</span>
                      <span className="meta-badge"><Users size={10} />{c.partner}</span>
                    </div>
                    {preview && <div className="company-preview">{preview}</div>}
                  </div>
                );
              })}
            </div>
            <div className="list-footer">
              <span>{companies.length} companies</span>
              <span>{companies.length - reviewedCount} pending</span>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="panel-right">
            {!selected ? (
              <div className="empty-state">
                <Building2 />
                <span>Select a company to begin</span>
              </div>
            ) : (
              <div className="detail-scroll" key={selectedIdx}>
                <div className="detail-header">
                  <div className="detail-name">{selected.name}</div>
                  <div className="detail-badges">
                    <span className="detail-badge"><User size={14} /> Analyst <strong>{selected.analyst}</strong></span>
                    <span className="detail-badge"><Users size={14} /> Partner <strong>{selected.partner}</strong></span>
                  </div>
                </div>

                <div className="section">
                  <div className="section-label">
                    <Clock size={13} />
                    This Week &middot; {dateLabels[currentDate] || currentDate}
                  </div>
                  <textarea
                    ref={textareaRef}
                    className="note-textarea"
                    defaultValue={selected.notes[currentDate] || ''}
                    onChange={e => updateNote(e.target.value)}
                    placeholder="Type meeting notes..."
                  />
                </div>

                {prevDate && (
                  <div className="section">
                    <div className="section-label">
                      <Clock size={13} />
                      Previous &middot; {dateLabels[prevDate] || prevDate}
                    </div>
                    <div className={`prev-note ${!(selected.notes[prevDate] || '').trim() ? 'empty' : ''}`}>
                      {(selected.notes[prevDate] || '').trim() || 'No notes from previous week'}
                    </div>
                  </div>
                )}

                <div className="section">
                  <button className="history-toggle" onClick={() => setHistoryOpen(!historyOpen)}>
                    {historyOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    Full History
                  </button>
                  {historyOpen && (
                    <div className="history-entries">
                      {[...dates].reverse().map(d => {
                        if (d === currentDate) return null;
                        const text = (selected.notes[d] || '').trim();
                        return (
                          <div key={d} className="history-entry">
                            <div className="history-date">{dateLabels[d] || d}</div>
                            <div className={`history-text ${!text ? 'empty' : ''}`}>
                              {text || 'No notes'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ ADD COMPANY MODAL ═══ */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Add Portfolio Company</div>
              <div className="modal-field">
                <label className="modal-label">Company Name</label>
                <input
                  className="modal-input"
                  placeholder="e.g., NewCo"
                  value={newCompany.name}
                  onChange={e => setNewCompany(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Analyst</label>
                <select className="modal-select" value={newCompany.analyst} onChange={e => setNewCompany(p => ({ ...p, analyst: e.target.value }))}>
                  {TEAM.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="modal-field">
                <label className="modal-label">Partner</label>
                <select className="modal-select" value={newCompany.partner} onChange={e => setNewCompany(p => ({ ...p, partner: e.target.value }))}>
                  {TEAM.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="modal-buttons">
                <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddCompany} disabled={!newCompany.name.trim()}>
                  <Plus size={14} /> Add Company
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TOAST ═══ */}
        {toast && (
          <div className={`toast ${toast === 'saved' ? 'success' : ''}`}>
            {toast === 'saved' ? <CheckCircle2 /> : <Check />}
            {toast === 'saved' ? 'Notes saved & synced to Google Sheets' : toast === 'newweek' ? 'New meeting week created' : 'Company added to portfolio'}
          </div>
        )}
      </div>
    </>
  );
}
