(function () {
  var STORAGE_CHECK = 'qatar-exit-kit-check-v1';
  var STORAGE_GRACE = 'qatar-exit-kit-grace-v1';
  var ITEMS = [
    { id: 'notice', phase: 'Employer notice & settlement', label: 'Resignation / end-of-contract notice given per your contract and Qatar labour law' },
    { id: 'eos', phase: 'Employer notice & settlement', label: 'End-of-service gratuity, final salary and leave encashment amounts confirmed in writing with HR' },
    { id: 'experience', phase: 'Employer notice & settlement', label: 'Experience / relieving letter and salary certificate requested from employer' },
    { id: 'bank-loans', phase: 'Banks & debts', label: 'Loans and credit cards settled early (unpaid bank debts can trigger a travel ban \u2014 clear them first)' },
    { id: 'bank-keep', phase: 'Banks & debts', label: 'Keep one Qatar bank account open until gratuity, deposit and Kahramaa refunds land' },
    { id: 'fines', phase: 'Banks & debts', label: 'Traffic violations and any other fines checked and paid on MOI portal / Metrash' },
    { id: 'landlord', phase: 'Housing', label: 'Landlord notice given per lease; move-out inspection booked; deposit refund terms agreed in writing' },
    { id: 'kahramaa', phase: 'Housing', label: 'Kahramaa (electricity & water) final reading, bill paid, clearance obtained, deposit refund requested' },
    { id: 'vehicle', phase: 'Vehicle', label: 'Vehicle sold / ownership transferred / export done BEFORE your residence permit is cancelled' },
    { id: 'telecom', phase: 'Telecom', label: 'Ooredoo / Vodafone postpaid converted to prepaid or closed; final bill cleared; home internet equipment returned' },
    { id: 'school', phase: 'Family', label: 'School transfer certificates (TC) and records collected for children' },
    { id: 'dep-rp', phase: 'Residence permits', label: 'Dependents\u2019 residence permits cancelled BEFORE the sponsor\u2019s RP' },
    { id: 'rp-cancel', phase: 'Residence permits', label: 'Your RP cancellation done (usually employer PRO via MOI); cancellation printout saved' },
    { id: 'exit-permit', phase: 'Residence permits', label: 'Checked on MOI / Metrash whether YOUR category still needs an exit permit (many no longer do since 2020 reforms)' },
    { id: 'grace', phase: 'Residence permits', label: 'Grace days and leave-by date written down from the cancellation document (helper below)' },
    { id: 'qid', phase: 'Documents & extras', label: 'Qatar ID copies saved; health card / insurance ended; last medical claims filed' },
    { id: 'attest', phase: 'Documents & extras', label: 'Degree / marriage / birth certificates and attested copies packed in hand luggage' },
    { id: 'licence', phase: 'Documents & extras', label: 'Qatar driving licence copy saved for converting your licence at home' },
    { id: 'cash', phase: 'Documents & extras', label: 'Cash / gold carry limits checked for Qatar exit and India arrival (confirm current customs rules)' }
  ];

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function renderChecklist() {
    var state = loadJSON(STORAGE_CHECK, {});
    var box = document.getElementById('check-list');
    box.innerHTML = '';
    var lastPhase = null;
    ITEMS.forEach(function (item) {
      if (item.phase !== lastPhase) {
        var ph = document.createElement('div');
        ph.className = 'phase';
        ph.textContent = item.phase;
        box.appendChild(ph);
        lastPhase = item.phase;
      }
      var row = document.createElement('label');
      row.className = 'check-row';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!state[item.id];
      cb.addEventListener('change', function () {
        state[item.id] = cb.checked;
        saveJSON(STORAGE_CHECK, state);
        updateStatus(state);
      });
      var span = document.createElement('span');
      span.textContent = item.label;
      row.appendChild(cb);
      row.appendChild(span);
      box.appendChild(row);
    });
    updateStatus(state);
  }

  function updateStatus(state) {
    var done = ITEMS.filter(function (i) { return state[i.id]; }).length;
    document.getElementById('check-status').textContent =
      done + ' of ' + ITEMS.length + ' items ready on this device.';
  }

  function addDays(date, days) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  function formatDate(d) {
    if (!d || isNaN(d.getTime())) return '\u2014';
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function calcGrace() {
    var input = document.getElementById('cancel-date');
    var daysEl = document.getElementById('grace-days');
    var notes = document.getElementById('grace-notes');
    var out = document.getElementById('grace-result');
    var fine = document.getElementById('fine-result');
    if (!input.value) {
      out.textContent = 'Enter a cancellation date first.';
      fine.textContent = '';
      return;
    }
    var cancel = new Date(input.value + 'T00:00:00');
    if (isNaN(cancel.getTime())) {
      out.textContent = 'Invalid date.';
      fine.textContent = '';
      return;
    }
    var days = parseInt(daysEl.value, 10);
    if (isNaN(days) || days < 0) {
      out.textContent = 'Enter a valid grace-days number.';
      fine.textContent = '';
      return;
    }
    var leaveBy = addDays(cancel, days);
    out.textContent = formatDate(leaveBy) +
      ' (cancel ' + formatDate(cancel) + ' + ' + days + ' grace days). Confirm on your cancellation document before you travel.';
    fine.textContent =
      'After the grace period, overstay fines and possible exit complications apply \u2014 confirm amounts on MOI / Metrash; this site does not calculate fines.';
    saveJSON(STORAGE_GRACE, {
      cancel: input.value,
      days: days,
      notes: notes.value || '',
      leaveBy: formatDate(leaveBy)
    });
  }

  function loadGrace() {
    var g = loadJSON(STORAGE_GRACE, {});
    if (g.cancel) document.getElementById('cancel-date').value = g.cancel;
    if (typeof g.days === 'number') document.getElementById('grace-days').value = g.days;
    if (g.notes) document.getElementById('grace-notes').value = g.notes;
    if (g.leaveBy) {
      document.getElementById('grace-result').textContent =
        g.leaveBy + ' (saved on this device). Confirm on your cancellation document before you travel.';
      document.getElementById('fine-result').textContent =
        'After the grace period, overstay fines apply \u2014 confirm on MOI / Metrash.';
    }
  }

  function exportSummary() {
    var state = loadJSON(STORAGE_CHECK, {});
    var g = loadJSON(STORAGE_GRACE, {});
    var lines = [
      'Qatar Exit Kit summary (not immigration or legal advice)',
      'Generated locally \u2014 ' + new Date().toISOString().slice(0, 10),
      '',
      'Checklist:'
    ];
    var lastPhase = null;
    ITEMS.forEach(function (i) {
      if (i.phase !== lastPhase) {
        lines.push('');
        lines.push('## ' + i.phase);
        lastPhase = i.phase;
      }
      lines.push((state[i.id] ? '[x] ' : '[ ] ') + i.label);
    });
    lines.push('');
    lines.push('Grace helper:');
    lines.push('Cancellation date: ' + (g.cancel || '\u2014'));
    lines.push('Grace days: ' + (typeof g.days === 'number' ? g.days : '\u2014'));
    lines.push('Leave-by reminder: ' + (g.leaveBy || '\u2014'));
    lines.push('Notes: ' + (g.notes || '\u2014'));
    lines.push('');
    lines.push('Verify on official portals (MOI / Metrash / Kahramaa / your bank) and on your cancellation paper.');
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        document.getElementById('check-status').textContent = 'Summary copied to clipboard.';
      }).catch(function () {
        window.prompt('Copy this summary:', text);
      });
    } else {
      window.prompt('Copy this summary:', text);
    }
  }

  document.getElementById('btn-export').addEventListener('click', exportSummary);
  document.getElementById('btn-print').addEventListener('click', function () { window.print(); });
  document.getElementById('btn-reset-check').addEventListener('click', function () {
    saveJSON(STORAGE_CHECK, {});
    renderChecklist();
  });
  document.getElementById('btn-calc-grace').addEventListener('click', calcGrace);
  document.getElementById('btn-clear-grace').addEventListener('click', function () {
    saveJSON(STORAGE_GRACE, {});
    document.getElementById('cancel-date').value = '';
    document.getElementById('grace-days').value = '30';
    document.getElementById('grace-notes').value = '';
    document.getElementById('grace-result').textContent = '\u2014';
    document.getElementById('fine-result').textContent = '';
  });

  renderChecklist();
  loadGrace();
})();
