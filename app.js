/* ── State ── */
let currentTemplate = 'classic';
let logoDataUrl = null;
let items = [
  { desc: 'Web Design & Development', qty: 1, rate: 3500 },
  { desc: 'SEO Optimisation', qty: 1, rate: 800 },
  { desc: 'Monthly Maintenance', qty: 3, rate: 250 },
];

const TEMPLATES = ['classic', 'modern', 'minimal', 'bold', 'corp', 'blossom', 'neon', 'sun', 'sage', 'ocean'];

/* ── Init defaults ── */
(function initDates() {
  const t = new Date();
  document.getElementById('inv-date').value = t.toISOString().split('T')[0];
  const d = new Date(t);
  d.setDate(d.getDate() + 30);
  document.getElementById('due-date').value = d.toISOString().split('T')[0];
})();

/* ── Template switching ── */
function setTemplate(t, btn) {
  currentTemplate = t;
  document.querySelectorAll('.tpl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function activateTemplateButton(tplId) {
  const idx = TEMPLATES.indexOf(tplId);
  document.querySelectorAll('.tpl-btn').forEach(b => b.classList.remove('active'));
  if (idx >= 0) document.querySelectorAll('.tpl-btn')[idx].classList.add('active');
}

/* ── Logo upload ── */
function handleLogoUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 1024 * 1024) {
    alert('Please use an image under 1MB for best performance.');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    logoDataUrl = e.target.result;
    renderLogoControl();
    render();
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  logoDataUrl = null;
  renderLogoControl();
  render();
}

function renderLogoControl() {
  const el = document.getElementById('logo-control');
  if (logoDataUrl) {
    el.innerHTML = `
      <div class="logo-preview-wrap">
        <img src="${logoDataUrl}" alt="Logo preview"/>
        <span style="font-size:12px;color:var(--muted);font-weight:600">Logo added</span>
        <button class="logo-remove" onclick="removeLogo()">Remove</button>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="logo-upload">
        <input type="file" accept="image/*" onchange="handleLogoUpload(this)"/>
        <div class="logo-upload-text">🖼️ Click to upload logo (optional)</div>
      </div>`;
  }
}

/* ── Line items ── */
function addItem() {
  items.push({ desc: 'New Service', qty: 1, rate: 0 });
  renderItems();
  render();
}

function removeItem(i) {
  items.splice(i, 1);
  renderItems();
  render();
}

function renderItems() {
  document.getElementById('items-list').innerHTML = items.map((item, i) => `
    <div class="item-row">
      <button class="remove-btn" onclick="removeItem(${i})">×</button>
      <input value="${item.desc}" oninput="items[${i}].desc=this.value;render()" style="width:100%;margin-bottom:4px;font-weight:600"/>
      <div class="item-meta">
        <div><label style="font-size:10px;color:var(--muted)">Qty</label>
          <input type="number" value="${item.qty}" oninput="items[${i}].qty=+this.value;render()" min="0"/></div>
        <div><label style="font-size:10px;color:var(--muted)">Rate</label>
          <input type="number" value="${item.rate}" oninput="items[${i}].rate=+this.value;render()" min="0"/></div>
        <div><label style="font-size:10px;color:var(--muted)">Amount</label>
          <input readonly value="${(item.qty * item.rate).toFixed(2)}" style="color:var(--muted)"/></div>
      </div>
    </div>`).join('');
}

/* ── Helpers ── */
function g(id) { return (document.getElementById(id) || {}).value || ''; }

function fmt(n) {
  const cur = g('currency');
  // IDR conventionally has no decimals and uses thousands separators
  if (cur === 'Rp') return 'Rp' + Math.round(n).toLocaleString('id-ID');
  return cur + Number(n).toFixed(2);
}

function calcTotals() {
  const sub = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const disc = sub * (parseFloat(g('disc-rate')) || 0) / 100;
  const tax = (sub - disc) * (parseFloat(g('tax-rate')) || 0) / 100;
  return { sub, disc, tax, total: sub - disc + tax };
}

function itemRows() {
  return items.map(i => `<tr><td>${i.desc}</td><td class="col-r">${i.qty}</td><td class="col-r">${fmt(i.rate)}</td><td class="col-r">${fmt(i.qty * i.rate)}</td></tr>`).join('');
}

function totalsRows() {
  const { sub, disc, tax, total } = calcTotals();
  const dr = parseFloat(g('disc-rate')) || 0, tr = parseFloat(g('tax-rate')) || 0;
  return `<div class="totals-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>`
    + (dr ? `<div class="totals-row"><span>Discount (${dr}%)</span><span>-${fmt(disc)}</span></div>` : '')
    + (tr ? `<div class="totals-row"><span>Tax (${tr}%)</span><span>${fmt(tax)}</span></div>` : '')
    + `<div class="totals-row total"><span>Total Due</span><span>${fmt(total)}</span></div>`;
}

function logoImg() {
  return logoDataUrl ? `<img class="inv-logo-img" src="${logoDataUrl}" alt="logo"/>` : '';
}

/* ── Template renderers ── */
const RENDERERS = {
  classic: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-classic">
    <div class="inv-header">
      <div>${logoImg()}<div class="inv-brand">${f.name}</div><div style="font-size:12px;color:var(--muted);margin-top:4px">${f.detail}</div></div>
      <div style="text-align:right"><div class="inv-title">Invoice</div><div class="inv-num">${n}</div></div>
    </div>
    <div class="inv-parties">
      <div><div class="party-label">From</div><div class="party-name">${f.name}</div><div class="party-detail">${f.detail}</div></div>
      <div><div class="party-label">Bill To</div><div class="party-name">${t.name}</div><div class="party-detail">${t.detail}</div></div>
    </div>
    <div class="inv-meta">
      <div class="meta-item"><div class="meta-key">Invoice #</div><div class="meta-val">${n}</div></div>
      <div class="meta-item"><div class="meta-key">Issue Date</div><div class="meta-val">${dt}</div></div>
      <div class="meta-item"><div class="meta-key">Due Date</div><div class="meta-val">${du}</div></div>
    </div>
    <table>${THEAD}<tbody>${itemRows()}</tbody></table>
    <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
    ${notes ? `<div class="inv-notes"><strong>Notes:</strong><br>${notesHtml}</div>` : ''}
    <div class="inv-footer">Thank you for your business!</div>
  </div>`,

  modern: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-modern">
    <div class="mod-sidebar">
      ${logoImg()}<div class="mod-brand">${f.name}</div>
      <div class="mod-accent-line"></div>
      <div class="mod-label">Invoice #</div><div class="mod-value">${n}</div>
      <div class="mod-label">Issue Date</div><div class="mod-value">${dt}</div>
      <div class="mod-label">Due Date</div><div class="mod-value">${du}</div>
      <div class="mod-label">From</div><div class="mod-value">${f.detail}</div>
    </div>
    <div class="mod-body">
      <div class="mod-title-row"><div class="mod-invoice-title">INVOICE</div><div class="mod-meta">${t.name}<br>${t.detail}</div></div>
      <div class="mod-to"><div class="mod-to-label">Billed To</div><div class="mod-to-name">${t.name}</div><div class="mod-to-detail">${t.detail}</div></div>
      <table>${THEAD}<tbody>${itemRows()}</tbody></table>
      <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
      ${notes ? `<div class="inv-notes">${notesHtml}</div>` : ''}
    </div>
  </div>`,

  minimal: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-minimal">
    <div class="min-header">
      <div>${logoImg()}<div class="min-brand">${f.name}</div></div>
      <div class="min-word">Invoice</div>
    </div>
    <div class="min-parties">
      <div><div class="min-label">From</div><div class="min-name">${f.name}</div><div class="min-detail">${f.detail}</div></div>
      <div><div class="min-label">Bill To</div><div class="min-name">${t.name}</div><div class="min-detail">${t.detail}</div></div>
    </div>
    <div class="min-meta">
      <div><div class="meta-key">Invoice #</div><div class="meta-val">${n}</div></div>
      <div><div class="meta-key">Date</div><div class="meta-val">${dt}</div></div>
      <div><div class="meta-key">Due</div><div class="meta-val">${du}</div></div>
    </div>
    <table>${THEAD}<tbody>${itemRows()}</tbody></table>
    <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
    ${notes ? `<div class="inv-notes">${notesHtml}</div>` : ''}
  </div>`,

  bold: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-bold">
    <div class="bold-top">
      <div class="bold-top-row">${logoImg()}<div class="bold-brand">${f.name}</div><div class="bold-num">${n}</div></div>
      <div class="bold-parties">
        <div><div class="bold-plabel">From</div><div class="bold-pname">${f.name}</div><div class="bold-pdetail">${f.detail}</div></div>
        <div><div class="bold-plabel">Billed To</div><div class="bold-pname">${t.name}</div><div class="bold-pdetail">${t.detail}</div></div>
      </div>
    </div>
    <div class="bold-meta-bar" style="color:#fff">
      <div class="bold-meta-item"><div class="bold-mkey">Invoice #</div><div class="bold-mval">${n}</div></div>
      <div class="bold-meta-item"><div class="bold-mkey">Issue Date</div><div class="bold-mval">${dt}</div></div>
      <div class="bold-meta-item"><div class="bold-mkey">Due Date</div><div class="bold-mval">${du}</div></div>
    </div>
    <div class="bold-body">
      <table>${THEAD}<tbody>${itemRows()}</tbody></table>
      <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
      ${notes ? `<div class="inv-notes">${notesHtml}</div>` : ''}
      <div class="bold-footer">Thank you for your business!</div>
    </div>
  </div>`,

  corp: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-corp">
    <div class="corp-stripe"></div>
    <div class="corp-head">
      <div class="corp-brand">${logoImg()}${f.name}</div>
      <div class="corp-inv"><div class="corp-inv-title">INVOICE</div><div class="corp-inv-num">${n}</div></div>
    </div>
    <div class="corp-info">
      <div><div class="ci-label">From</div><div class="ci-name">${f.name}</div><div class="ci-detail">${f.detail}</div></div>
      <div><div class="ci-label">Billed To</div><div class="ci-name">${t.name}</div><div class="ci-detail">${t.detail}</div></div>
      <div>
        <div><div class="ci-label">Invoice Date</div><div class="ci-name">${dt}</div></div>
        <div style="margin-top:12px"><div class="ci-label">Due Date</div><div class="ci-name">${du}</div></div>
      </div>
    </div>
    <div class="corp-body">
      <table>${THEAD}<tbody>${itemRows()}</tbody></table>
      <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
      ${notes ? `<div class="inv-notes">${notesHtml}</div>` : ''}
    </div>
    <div class="corp-foot"><span>${f.name}</span><span>${n}</span></div>
  </div>`,

  blossom: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-blossom">
    <div class="bls-hero">
      <div class="bls-brand-row">${logoImg()}<div><div class="bls-brand">${f.name}</div><div class="bls-tagline">Creating with love ✨</div></div></div>
      <div class="bls-inv-row">
        <div class="bls-inv-word">Invoice</div>
        <div class="bls-inv-num">${n}<br><span style="font-size:11px;font-weight:400">Due: ${du}</span></div>
      </div>
      <div class="bls-pills"><div class="bls-pill">📅 ${dt}</div><div class="bls-pill">💌 ${t.name}</div></div>
    </div>
    <div class="bls-body">
      <div class="bls-parties">
        <div><div class="bls-plabel">From</div><div class="bls-pname">${f.name}</div><div class="bls-pdetail">${f.detail}</div></div>
        <div><div class="bls-plabel">Billed To</div><div class="bls-pname">${t.name}</div><div class="bls-pdetail">${t.detail}</div></div>
      </div>
      <table>${THEAD}<tbody>${itemRows()}</tbody></table>
      <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
      ${notes ? `<div class="inv-notes">💕 ${notesHtml}</div>` : ''}
      <div class="bls-footer">Thank you so much! 🌸</div>
    </div>
  </div>`,

  neon: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-neon">
    <div class="neo-header">
      <div class="neo-brand-row">${logoImg()}<div><div class="neo-brand">${f.name}</div><div class="neo-tagline">// DIGITAL INVOICE SYSTEM</div></div></div>
      <div class="neo-inv-num"><div class="neo-label">Invoice ID</div><div class="neo-val">${n}</div></div>
    </div>
    <div class="neo-body">
      <div class="neo-parties">
        <div><div class="neo-plabel">From</div><div class="neo-pname">${f.name}</div><div class="neo-pdetail">${f.detail}</div></div>
        <div><div class="neo-plabel">Billed To</div><div class="neo-pname">${t.name}</div><div class="neo-pdetail">${t.detail}</div></div>
      </div>
      <div class="neo-meta">
        <div class="neo-meta-item"><div class="neo-mk">Issue Date</div><div class="neo-mv">${dt}</div></div>
        <div class="neo-meta-item"><div class="neo-mk">Due Date</div><div class="neo-mv">${du}</div></div>
        <div class="neo-meta-item"><div class="neo-mk">Status</div><div class="neo-mv" style="color:#a855f7">PENDING</div></div>
      </div>
      <table>${THEAD}<tbody>${itemRows()}</tbody></table>
      <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
      ${notes ? `<div class="inv-notes">// NOTES<br>${notesHtml}</div>` : ''}
    </div>
    <div class="neo-footer">// END OF INVOICE — ${f.name.toUpperCase()}</div>
  </div>`,

  sun: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-sun">
    <div class="sun-top">
      <div class="sun-brand-box">${logoImg()}<div><div class="sun-brand">${f.name}</div><div class="sun-sub">Invoice for ${t.name}</div></div></div>
      <div class="sun-badge"><div class="sun-badge-word">Invoice</div><div class="sun-badge-num">${n}</div></div>
    </div>
    <div class="sun-body">
      <div class="sun-parties">
        <div><div class="sun-plabel">From</div><div class="sun-pname">${f.name}</div><div class="sun-pdetail">${f.detail}</div></div>
        <div><div class="sun-plabel">Billed To</div><div class="sun-pname">${t.name}</div><div class="sun-pdetail">${t.detail}</div></div>
      </div>
      <div class="sun-meta">
        <div class="sun-meta-item"><div class="sun-mk">Issue Date</div><div class="sun-mv">${dt}</div></div>
        <div class="sun-meta-item"><div class="sun-mk">Due Date</div><div class="sun-mv">${du}</div></div>
      </div>
      <table>${THEAD}<tbody>${itemRows()}</tbody></table>
      <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
      ${notes ? `<div class="inv-notes">${notesHtml}</div>` : ''}
      <div class="sun-footer">☀️ Thank you for your support!</div>
    </div>
  </div>`,

  sage: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-sage">
    <div class="sage-header">
      <div class="sage-brand-row">${logoImg()}<div><div class="sage-brand">${f.name}</div><div class="sage-brandtag">handcrafted with care</div></div></div>
      <div class="sage-inv-block"><div class="sage-inv-label">Invoice</div><div class="sage-inv-num">${n}</div></div>
    </div>
    <div class="sage-divider"></div>
    <div class="sage-parties">
      <div><div class="sage-plabel">From</div><div class="sage-pname">${f.name}</div><div class="sage-pdetail">${f.detail}</div></div>
      <div><div class="sage-plabel">Billed To</div><div class="sage-pname">${t.name}</div><div class="sage-pdetail">${t.detail}</div></div>
    </div>
    <div class="sage-meta">
      <div class="sage-meta-item"><div class="sage-mk">Issue Date</div><div class="sage-mv">${dt}</div></div>
      <div class="sage-meta-item"><div class="sage-mk">Due Date</div><div class="sage-mv">${du}</div></div>
    </div>
    <div class="sage-table-wrap">
      <table>${THEAD}<tbody>${itemRows()}</tbody></table>
      <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
    </div>
    ${notes ? `<div class="inv-notes">${notesHtml}</div>` : ''}
    <div class="sage-footer">Thank you for choosing ${f.name} 🌿</div>
  </div>`,

  ocean: (f, t, n, dt, du, notes, notesHtml) => `<div class="tpl-ocean">
    <div class="oc-header">
      <div class="oc-brand-row">${logoImg()}<div><div class="oc-brand">${f.name}</div><div class="oc-sub">${f.detail.split('<br>')[0] || ''}</div></div></div>
      <div class="oc-inv-block"><div class="oc-inv-title">INVOICE</div><div class="oc-inv-num">${n}</div></div>
    </div>
    <div class="oc-body">
      <div class="oc-parties">
        <div><div class="oc-plabel">From</div><div class="oc-pname">${f.name}</div><div class="oc-pdetail">${f.detail}</div></div>
        <div><div class="oc-plabel">Billed To</div><div class="oc-pname">${t.name}</div><div class="oc-pdetail">${t.detail}</div></div>
      </div>
      <div class="oc-meta">
        <div><div class="oc-mk">Issue Date</div><div class="oc-mv">${dt}</div></div>
        <div><div class="oc-mk">Due Date</div><div class="oc-mv">${du}</div></div>
      </div>
      <table>${THEAD}<tbody>${itemRows()}</tbody></table>
      <div class="totals"><div class="totals-box">${totalsRows()}</div></div>
      ${notes ? `<div class="inv-notes">${notesHtml}</div>` : ''}
      <div class="oc-footer">Thank you for your business!</div>
    </div>
  </div>`,
};

const THEAD = `<thead><tr><th>Description</th><th class="col-r">Qty</th><th class="col-r">Rate</th><th class="col-r">Amount</th></tr></thead>`;

/* ── Main render ── */
function render() {
  const canvas = document.getElementById('invoice-canvas');
  const from = { name: g('from-name'), detail: g('from-detail').replace(/\n/g, '<br>') };
  const to = { name: g('to-name'), detail: g('to-detail').replace(/\n/g, '<br>') };
  const num = g('inv-num'), date = g('inv-date'), due = g('due-date'), notes = g('notes');
  const notesHtml = notes.replace(/\n/g, '<br>');

  const renderer = RENDERERS[currentTemplate] || RENDERERS.classic;
  canvas.innerHTML = renderer(from, to, num, date, due, notes, notesHtml);
}

/* ── Share link ── */
function copyLink() {
  const state = {
    from: g('from-name'), fromD: g('from-detail'),
    to: g('to-name'), toD: g('to-detail'),
    num: g('inv-num'), date: g('inv-date'), due: g('due-date'),
    tax: g('tax-rate'), disc: g('disc-rate'), cur: g('currency'),
    notes: g('notes'), tpl: currentTemplate, items, logo: logoDataUrl
  };
  const url = location.href.split('#')[0] + '#' + btoa(encodeURIComponent(JSON.stringify(state)));
  navigator.clipboard.writeText(url).then(() => alert('Link copied! Share it to let anyone view this invoice.'));
}

const FIELD_MAP = {
  'from-name': 'from', 'from-detail': 'fromD',
  'to-name': 'to', 'to-detail': 'toD',
  'inv-num': 'num', 'inv-date': 'date', 'due-date': 'due',
  'tax-rate': 'tax', 'disc-rate': 'disc', 'notes': 'notes'
};

function loadFromHash() {
  if (!location.hash) return;
  try {
    const s = JSON.parse(decodeURIComponent(atob(location.hash.slice(1))));
    Object.entries(FIELD_MAP).forEach(([id, key]) => {
      if (s[key] !== undefined) document.getElementById(id).value = s[key];
    });
    document.getElementById('currency').value = s.cur || '$';
    items = s.items || items;
    logoDataUrl = s.logo || null;
    currentTemplate = s.tpl || 'classic';
    activateTemplateButton(currentTemplate);
  } catch (e) {
    console.warn('Could not load invoice from link:', e);
  }
}

/* ── Boot ── */
loadFromHash();
renderLogoControl();
renderItems();
render();
