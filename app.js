/* ═══════════════════════════════════════════════════
   TGA DIGITAL – APP.JS
   Tecnólogo en Gestión Administrativa · SENA
═══════════════════════════════════════════════════ */
'use strict';

/* ─── ESTADO GLOBAL ─── */
const STATE = {
  theme: localStorage.getItem('tga-theme') || 'dark',
  progress: JSON.parse(localStorage.getItem('tga-progress') || '{}'),
  quizAnswers: {},
};

/* ─── UTILIDADES ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function saveProgress() {
  localStorage.setItem('tga-progress', JSON.stringify(STATE.progress));
  updateGlobalProgress();
}

function toast(msg, type = 'info') {
  const c = $('#toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.innerHTML = `<span>${icons[type] || '💬'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function animateNumber(el, target, duration = 1200) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

window.copyCode = function (btn) {
  const code = btn.nextElementSibling.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.textContent;
    btn.textContent = '¡Copiado!';
    btn.classList.add('success');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('success');
    }, 2000);
  }).catch(err => {
    console.error('Error al copiar:', err);
    toast('Error al copiar el código', 'error');
  });
};

/* ─── MÓDULO EXTRA: SIMULADOR SQL INTERACTIVO ─── */
function initSQLSimulator() {
  const sourceGrid = $('#sql-source-blocks');
  const targetZone = $('#sql-target-zone');
  const livePreview = $('#sql-live-preview');
  const placeholder = $('#sql-placeholder-msg');
  const resetBtn = $('#btn-reset-sql');
  const validationStatus = $('#sql-validation-status');

  if (!sourceGrid || !targetZone) return;

  const validSequence = ['SELECT', '*', 'nombre, salario', 'FROM', 'Empleados', 'WHERE', 'salario > 2000', 'ORDER BY', 'nombre ASC'];
  let currentBlocks = [];

  function updatePreview() {
    if (currentBlocks.length === 0) {
      livePreview.innerHTML = '<span style="color: var(--c-sql-com);">-- Tu código SQL aparecerá aquí</span>';
      placeholder.style.display = 'block';
      validationStatus.style.opacity = '0';
      return;
    }

    placeholder.style.display = 'none';

    let sqlStr = '';
    let isComplete = false;

    // Build the string with basic formatting
    currentBlocks.forEach((blockStr, i) => {
      if (['SELECT', 'FROM', 'WHERE', 'ORDER BY'].includes(blockStr)) {
        sqlStr += (i > 0 ? '\n' : '') + `<span style="color: var(--c-sql-kw); font-weight: bold;">${blockStr}</span> `;
      } else {
        sqlStr += `<span style="color: var(--c-sql-str);">${blockStr}</span> `;
      }
    });

    livePreview.innerHTML = sqlStr.trim() + ';';

    // Simple validation logic
    const structure = currentBlocks.filter(b => ['SELECT', 'FROM', 'WHERE', 'ORDER BY'].includes(b));
    const hasSelectFrom = structure.includes('SELECT') && structure.includes('FROM') && currentBlocks.indexOf('SELECT') < currentBlocks.indexOf('FROM');

    // Check if it's a valid minimal query (SELECT something FROM somewhere)
    if (hasSelectFrom) {
      const selectIdx = currentBlocks.indexOf('SELECT');
      const fromIdx = currentBlocks.indexOf('FROM');
      if (fromIdx - selectIdx > 1 && currentBlocks.length > fromIdx + 1) {
        isComplete = true; // Minimal valid structure
      }
    }

    if (isComplete) {
      validationStatus.style.opacity = '1';
      targetZone.style.borderColor = 'var(--c-success)';
      targetZone.style.background = 'rgba(52, 168, 83, 0.05)';

      // Save progress if they built a cool query
      if (currentBlocks.length >= 4) {
        STATE.progress[`msql-interactive-done`] = true;
        saveProgress();
      }
    } else {
      validationStatus.style.opacity = '0';
      targetZone.style.borderColor = 'var(--c-border)';
      targetZone.style.background = 'var(--c-surface2)';
    }
  }

  function handleBlockClick(e) {
    if (!e.target.classList.contains('sql-block-btn')) return;

    const block = e.target;
    const str = block.dataset.str;
    const isSource = block.parentElement === sourceGrid;

    // Add animation effect
    block.style.transform = 'scale(0.9)';
    setTimeout(() => block.style.transform = '', 150);

    if (isSource) {
      // Move to target
      currentBlocks.push(str);
      const clone = block.cloneNode(true);
      clone.classList.add('in-target');

      // Add sound or particle effect here if desired (reusing existing TGA DNA)

      targetZone.appendChild(clone);
      block.classList.add('opacity-50', 'pointer-events-none');
    } else {
      // Remove from target
      const idx = currentBlocks.lastIndexOf(str);
      if (idx > -1) currentBlocks.splice(idx, 1);

      // Re-enable in source
      const original = Array.from(sourceGrid.children).find(c => c.dataset.str === str && c.classList.contains('opacity-50'));
      if (original) original.classList.remove('opacity-50', 'pointer-events-none');

      block.remove();
    }

    updatePreview();
  }

  sourceGrid.addEventListener('click', handleBlockClick);
  targetZone.addEventListener('click', handleBlockClick);

  resetBtn?.addEventListener('click', () => {
    currentBlocks = [];
    targetZone.querySelectorAll('.sql-block-btn').forEach(b => b.remove());
    sourceGrid.querySelectorAll('.sql-block-btn').forEach(b => b.classList.remove('opacity-50', 'pointer-events-none'));
    updatePreview();
  });
}


/* ─── SPLASH ─── */
function initSplash() {
  setTimeout(() => {
    const s = $('#splash-screen');
    if (s) { s.classList.add('hidden'); s.addEventListener('transitionend', () => s.remove(), { once: true }); }
  }, 2000);
}

/* ─── TEMA ─── */
function initTheme() {
  document.documentElement.setAttribute('data-theme', STATE.theme);
  const btn = $('#theme-toggle');
  if (!btn) return;
  const sun = btn.querySelector('.icon-sun');
  const moon = btn.querySelector('.icon-moon');
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', STATE.theme);
    if (STATE.theme === 'dark') {
      sun.style.display = ''; moon.style.display = 'none';
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#030712');
    } else {
      sun.style.display = 'none'; moon.style.display = '';
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#ffffff');
    }
    localStorage.setItem('tga-theme', STATE.theme);
  }
  btn.addEventListener('click', () => {
    STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  });
  applyTheme();
}

/* ─── NAVBAR ACTIVO ─── */
function initNavActive() {
  const sections = $$('section[id]');
  const links = $$('.nav-link, .mobile-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));

  // Mobile menu
  const toggle = $('#menu-toggle');
  const menu = $('#mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-hidden', !open);
    });
    $$('.mobile-link').forEach(l => l.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    }));
  }
}

/* ─── PROGRESO GLOBAL ─── */
function updateGlobalProgress() {
  const modules = [1, 'sql', 2, 3, 4, 5];
  const guideTotals = { 1: 15, 'sql': 5, 2: 7, 3: 7, 4: 7, 5: 8, drv5: 4 };
  let globalSum = 0;

  modules.forEach((m) => {
    let modulePct = 0;

    // 1. Iniciado (10%)
    if (STATE.progress[`m${m}-started`]) modulePct += 10;

    // 2. Guía Práctica (40% proporcional)
    const stepsDone = STATE.progress[`m${m}-steps`] || 0;
    const totalSteps = guideTotals[m];
    const guidePct = Math.min(40, (stepsDone / totalSteps) * 40);
    modulePct += guidePct;

    // 3. Quiz o Entregable Final (50%)
    if (m === 5) {
      const drvDone = STATE.progress[`m5drv-steps`] || 0;
      modulePct += (drvDone / 2) * 50;
    } else {
      if (STATE.progress[`quiz-m${m}-done`]) modulePct += 50;
    }

    modulePct = Math.round(modulePct);
    globalSum += modulePct;

    // Actualizar barras locales
    const mBar = $(`#m${m}-progress`);
    if (mBar) mBar.style.width = modulePct + '%';

    const pipeBar = $(`#step-prog-${m}`);
    const pipePct = $(`#step-pct-${m}`);
    if (pipeBar) pipeBar.style.width = modulePct + '%';
    if (pipePct) pipePct.textContent = modulePct + '%';
  });

  // Progreso Total
  const totalPct = Math.round(globalSum / modules.length);
  const pctEl = $('#progress-pct');
  const certEl = $('#cert-progress-pct');

  if (pctEl) pctEl.textContent = totalPct + '%';
  if (certEl) certEl.textContent = totalPct + '%';

  const ring = $('#progress-ring-fill');
  if (ring) {
    const circ = 2 * Math.PI * 14;
    ring.style.strokeDashoffset = circ - (circ * totalPct / 100);
  }
}

/* ─── PARTÍCULAS HERO ─── */
function initParticles() {
  const container = $('#particles');
  if (!container) return;
  const colors = ['#39d0b8', '#5b6cff', '#a855f7', '#f59e0b'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 30 + 8;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 12 + 8}s;
      animation-delay:${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}

/* ─── ANIMACIÓN NÚMEROS HERO ─── */
function initStatCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$('[data-target]', e.target.closest('section')).forEach(el => {
          animateNumber(el, parseInt(el.dataset.target));
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  const heroStats = $('.hero-stats');
  if (heroStats) observer.observe(heroStats);
}

/* ─── TABS ─── */
function initTabs() {
  $$('.tabs').forEach(tabBar => {
    const tabs = $$('.tab', tabBar);
    const parentContainer = tabBar.closest('.module-body') || tabBar.closest('section');
    if (!parentContainer) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const panelId = tab.getAttribute('aria-controls');
        const panel = parentContainer.querySelector(`#${panelId}`);
        if (!panel) return;

        // Get all tabs and panels within this specific container context
        const containerTabs = tabBar.querySelectorAll('.tab');
        const containerPanels = parentContainer.querySelectorAll(':scope > .tab-panel, :scope > .container > .tab-panel');

        containerTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        // Hide all panels at the same level
        parentContainer.querySelectorAll('.tab-panel').forEach(p => {
          if (p.parentElement === panel.parentElement) {
            p.classList.remove('active');
          }
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        panel.classList.add('active');

        // mark module started
        const moduleSection = tabBar.closest('[data-module]');
        if (moduleSection) {
          STATE.progress[`m${moduleSection.dataset.module}-started`] = true;
          saveProgress();
        }
      });
    });
  });
}

/* ─── MINI TABS (Dentro de Guías) ─── */
function initMiniTabs() {
  $$('.tabs--mini').forEach(tabBar => {
    const tabs = $$('.tab', tabBar);
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.target;
        const container = tab.closest('.gs-content');
        if (!container) return;

        // Reset tabs
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        // Reset panels
        $$('.tab-panel-mini', container).forEach(p => p.classList.add('hidden'));

        // Activate
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        $(`#${targetId}`, container)?.classList.remove('hidden');
      });
    });
  });
}

/* ─── CONCEPTOS: TOGGLE DETALLE Y EFECTO 3D ─── */
function initConceptCards() {
  $$('.concept-card').forEach(card => {
    // 3D Tilt Effect
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transition = 'none'; // Snap to mouse
      card.style.transform = `translateY(-4px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = ''; // Fallback to CSS
    });

    const btn = $('.concept-toggle', card);
    const detail = $('.concept-detail', card);
    if (!btn || !detail) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = detail.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'Cerrar ↑' : 'Más info ↓';
    });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') btn.click(); });
  });
}

/* ─── MÓDULO 1: CONSTRUCTOR DE TABLAS ─── */
const FIELD_TYPES = ['Autonumérico', 'Texto corto', 'Texto largo', 'Número', 'Moneda', 'Fecha/Hora', 'Sí/No', 'Hipervínculo'];

const PRESETS = {
  clientes: {
    name: 'MAESTRO_CLIENTES',
    fields: [
      { pk: true, name: 'ID_CLIENTE', type: 'Autonumérico', required: true, desc: 'PK: Código único interno' },
      { pk: false, name: 'Nombre_RazonSocial', type: 'Texto corto', required: true, desc: 'Nombre legal de la entidad' },
      { pk: false, name: 'NIT_CC', type: 'Texto corto', required: true, desc: 'Identificación tributaria' },
      { pk: false, name: 'Ciudad_Sede', type: 'Texto corto', required: false, desc: 'Ubicación principal' },
      { pk: false, name: 'Telefono_Contacto', type: 'Texto corto', required: true, desc: 'Número de celular o fijo' },
      { pk: false, name: 'Fecha_Vinculacion', type: 'Fecha/Hora', required: true, desc: 'Fecha de alta en el sistema' },
      { pk: false, name: 'Cupo_Credito', type: 'Moneda', required: false, desc: 'Límite máximo de deuda' },
    ]
  },
  productos: {
    name: 'CATALOGO_PRODUCTOS',
    fields: [
      { pk: true, name: 'ID_PRODUCTO', type: 'Autonumérico', required: true, desc: 'PK: Código de barras interno' },
      { pk: false, name: 'Descripcion_Articulo', type: 'Texto corto', required: true, desc: 'Nombre comercial del producto' },
      { pk: false, name: 'Familia_Categoria', type: 'Texto corto', required: true, desc: 'Categorización (Ej: Aseo)' },
      { pk: false, name: 'Precio_Unitario', type: 'Moneda', required: true, desc: 'Precio de venta al público' },
      { pk: false, name: 'Stock_Actual', type: 'Número', required: true, desc: 'Unidades en bodega' },
      { pk: false, name: 'Minimo_Seguridad', type: 'Número', required: true, desc: 'Punto de reorden' },
      { pk: false, name: 'Estado_Disponible', type: 'Sí/No', required: true, desc: 'Habilitado para la venta' },
    ]
  },
  pedidos: {
    name: 'HISTORICO_VENTAS',
    fields: [
      { pk: true, name: 'ID_TRANSACCION', type: 'Autonumérico', required: true, desc: 'PK: Consecutivo de factura' },
      { pk: false, name: 'ID_CLIENTE', type: 'Número', required: true, desc: 'FK: Vinculado a MAESTRO_CLIENTES' },
      { pk: false, name: 'ID_PRODUCTO', type: 'Número', required: true, desc: 'FK: Vinculado a CATALOGO_PRODUCTOS' },
      { pk: false, name: 'Cantidad_Despachada', type: 'Número', required: true, desc: 'Unidades del ítem' },
      { pk: false, name: 'Fecha_Emision', type: 'Fecha/Hora', required: true, desc: 'Fecha y hora del movimiento' },
      { pk: false, name: 'Subtotal_Gravado', type: 'Moneda', required: true, desc: 'Base imponible' },
    ]
  },
  empleados: {
    name: 'EMPLEADOS',
    fields: [
      { pk: true, name: 'ID_EMPLEADO', type: 'Autonumérico', required: true, desc: 'Identificador único del empleado' },
      { pk: false, name: 'Nombres', type: 'Texto corto', required: true, desc: 'Nombres completos' },
      { pk: false, name: 'Apellidos', type: 'Texto corto', required: true, desc: 'Apellidos completos' },
      { pk: false, name: 'Cargo', type: 'Texto corto', required: true, desc: 'Puesto que desempeña' },
      { pk: false, name: 'SalarioBase', type: 'Moneda', required: true, desc: 'Salario contratado' },
      { pk: false, name: 'FechaIngreso', type: 'Fecha/Hora', required: true, desc: 'Fecha de alta en nómina' },
    ]
  },
  proveedores: {
    name: 'PROVEEDORES',
    fields: [
      { pk: true, name: 'ID_PROVEEDOR', type: 'Autonumérico', required: true, desc: 'Identificador único del proveedor' },
      { pk: false, name: 'RazonSocial', type: 'Texto corto', required: true, desc: 'Nombre o razón social' },
      { pk: false, name: 'NIT', type: 'Texto corto', required: true, desc: 'Número de identificación fiscal' },
      { pk: false, name: 'Contacto', type: 'Texto corto', required: false, desc: 'Nombre del representante' },
      { pk: false, name: 'Telefono', type: 'Texto corto', required: false, desc: 'Teléfono corporativo' },
      { pk: false, name: 'Email', type: 'Texto corto', required: false, desc: 'Correo electrónico' },
    ]
  }
};

function createFieldRow(field = null) {
  const tr = document.createElement('tr');
  const f = field || { pk: false, name: '', type: 'Texto corto', required: false, desc: '' };
  tr.innerHTML = `
    <td><input type="checkbox" class="pk-checkbox" title="Llave Primaria" ${f.pk ? 'checked' : ''}></td>
    <td><input type="text" class="field-input" placeholder="NombreCampo" value="${f.name}" maxlength="30"></td>
    <td><select class="field-select">${FIELD_TYPES.map(t => `<option ${t === f.type ? 'selected' : ''}>${t}</option>`).join('')}</select></td>
    <td><input type="checkbox" class="pk-checkbox" ${f.required ? 'checked' : ''}></td>
    <td><input type="text" class="field-input" placeholder="Descripción..." value="${f.desc}"></td>
    <td><button class="delete-row-btn" title="Eliminar campo" aria-label="Eliminar campo">✕</button></td>
  `;
  tr.querySelector('.delete-row-btn').addEventListener('click', () => tr.remove());
  return tr;
}

function generateSQL() {
  const tableName = ($('#table-name-input')?.value || 'MI_TABLA').toUpperCase().replace(/\s/g, '_');
  const rows = $$('#fields-tbody tr');
  if (rows.length === 0) { toast('Agrega al menos un campo', 'error'); return; }
  const cols = [];
  const pks = [];
  rows.forEach(row => {
    const cells = $$('input, select', row);
    const isPK = cells[0]?.checked;
    const name = cells[1]?.value || 'Campo';
    const type = cells[2]?.value || 'Texto corto';
    const req = cells[3]?.checked;
    const sqlType = { 'Autonumérico': 'AUTOINCREMENT', 'Texto corto': 'VARCHAR(255)', 'Texto largo': 'TEXT', 'Número': 'INTEGER', 'Moneda': 'DECIMAL(15,2)', 'Fecha/Hora': 'DATETIME', 'Sí/No': 'BOOLEAN', 'Hipervínculo': 'VARCHAR(500)' }[type] || 'VARCHAR(255)';
    cols.push(`  ${name.padEnd(20)} ${sqlType}${req ? ' NOT NULL' : ''}`);
    if (isPK) pks.push(name);
  });
  if (pks.length) cols.push(`  PRIMARY KEY (${pks.join(', ')})`);
  const sql = `CREATE TABLE ${tableName} (\n${cols.join(',\n')}\n);`;
  const out = $('#sql-output');
  const preview = $('#sql-preview');
  if (out) out.textContent = sql;
  if (preview) preview.hidden = false;
}

function initTableBuilder() {
  const addBtn = $('#add-field-btn');
  const genBtn = $('#generate-sql-btn');
  const tbody = $('#fields-tbody');
  const copyBtn = $('#copy-sql-btn');
  if (!addBtn || !tbody) return;

  // default row
  tbody.appendChild(createFieldRow({ pk: true, name: 'ID', type: 'Autonumérico', required: true, desc: 'Llave primaria' }));

  addBtn.addEventListener('click', () => tbody.appendChild(createFieldRow()));
  genBtn?.addEventListener('click', generateSQL);
  copyBtn?.addEventListener('click', () => {
    const sql = $('#sql-output')?.textContent;
    if (sql) { navigator.clipboard?.writeText(sql); toast('SQL copiado al portapapeles', 'success'); }
  });

  $$('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = PRESETS[btn.dataset.preset];
      if (!preset) return;
      const inp = $('#table-name-input');
      if (inp) inp.value = preset.name;
      tbody.innerHTML = '';
      preset.fields.forEach(f => tbody.appendChild(createFieldRow(f)));
      generateSQL();
      toast(`Tabla ${preset.name} cargada`, 'success');
    });
  });
}

/* ─── MÓDULO 1: RELACIONES CANVAS ─── */
function initRelationsCanvas() {
  const canvas = $('#relations-canvas');
  if (!canvas) return;

  const tablesData = [
    { id: 'cli', name: 'CLIENTES', x: 30, y: 40, fields: [{ n: 'ID_CLIENTE', pk: true }, { n: 'Nombre' }, { n: 'Ciudad' }] },
    { id: 'ped', name: 'PEDIDOS', x: 300, y: 40, fields: [{ n: 'ID_PEDIDO', pk: true }, { n: 'ID_CLIENTE', fk: true }, { n: 'Monto' }] },
    { id: 'pro', name: 'PRODUCTOS', x: 300, y: 240, fields: [{ n: 'ID_PRODUCTO', pk: true }, { n: 'Nombre' }, { n: 'Precio' }] },
  ];

  const relations = [
    { from: 'cli', fromField: 'ID_CLIENTE', to: 'ped', toField: 'ID_CLIENTE', type: '1:N' },
    { from: 'pro', fromField: 'ID_PRODUCTO', to: 'ped', toField: 'ID_PRODUCTO', type: '1:N' },
  ];

  // SVG for lines
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('rel-lines');
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';
  canvas.style.position = 'relative';
  canvas.appendChild(svg);

  const tableEls = {};
  tablesData.forEach(td => {
    const el = document.createElement('div');
    el.className = 'rel-table';
    el.style.cssText = `left:${td.x}px;top:${td.y}px;`;
    el.id = 'rel-' + td.id;
    el.innerHTML = `<div class="rel-table-header">${td.name}</div>` +
      td.fields.map(f => `<div class="rel-table-field ${f.pk ? 'pk' : f.fk ? 'fk' : ''}">${f.pk ? '🔑 ' : f.fk ? '🔗 ' : '📝 '}${f.n}</div>`).join('');
    canvas.appendChild(el);
    tableEls[td.id] = el;

    // --- DRAG LOGIC ---
    let isDragging = false;
    let startX, startY;

    el.querySelector('.rel-table-header').addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.clientX - el.offsetLeft;
      startY = e.clientY - el.offsetTop;
      el.style.zIndex = '100';
      $$('.rel-table').forEach(t => { if (t !== el) t.style.zIndex = '10'; });
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      let newX = e.clientX - startX;
      let newY = e.clientY - startY;

      // Bounds check
      const cR = canvas.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, cR.width - el.offsetWidth));
      newY = Math.max(0, Math.min(newY, cR.height - el.offsetHeight));

      el.style.left = newX + 'px';
      el.style.top = newY + 'px';
      drawRelations();
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  });

  function drawRelations() {
    svg.innerHTML = '';
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#5b6cff"/></marker>`;
    svg.appendChild(defs);

    relations.forEach(rel => {
      const fromEl = tableEls[rel.from];
      const toEl = tableEls[rel.to];
      if (!fromEl || !toEl) return;
      const fR = fromEl.getBoundingClientRect();
      const tR = toEl.getBoundingClientRect();
      const cR = canvas.getBoundingClientRect();
      const x1 = fR.right - cR.left;
      const y1 = fR.top - cR.top + fR.height / 2;
      const x2 = tR.left - cR.left;
      const y2 = tR.top - cR.top + tR.height / 2;
      const mid = (x1 + x2) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`);
      path.setAttribute('stroke', '#5b6cff');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', 'url(#arr)');
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.textContent = rel.type;
      label.setAttribute('x', mid);
      label.setAttribute('y', (y1 + y2) / 2 - 6);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', '#9aa3b8');
      svg.appendChild(path);
      svg.appendChild(label);
    });
  }

  setTimeout(drawRelations, 100);
  window.addEventListener('resize', drawRelations);

  // Integridad referencial demo
  const validClients = [1, 2, 3, 4, 5];
  const testBtn = $('#test-integrity-btn');
  testBtn?.addEventListener('click', () => {
    const valInput = $('#nuevo-pedido-cliente');
    const val = parseInt(valInput?.value);
    const result = $('#integrity-result');
    const demoRow = $('#integrity-demo-row');
    const demoVal = $('#integrity-demo-val');
    const demoFoot = $('#integrity-demo-foot');
    if (!result || !demoRow || !demoVal) return;

    // Reset state & show loading
    result.style.display = 'none';
    demoRow.className = 'pending-row';
    demoVal.textContent = isNaN(val) ? '?' : val;
    testBtn.disabled = true;
    testBtn.innerHTML = '<span>⏳</span> Validando...';

    setTimeout(() => {
      testBtn.disabled = false;
      testBtn.innerHTML = '<span>⚡</span> Probar Inserción';

      if (validClients.includes(val)) {
        demoRow.className = 'success-row animate-pop';
        demoFoot.innerHTML = '<span class="text-success">✅ ¡Relación válida!</span>';
        result.className = 'integrity-result success';
        result.innerHTML = `
          <div class="flex flex-col gap-8">
            <div class="flex items-center gap-10">
              <span class="integrity-icon">✅</span> 
              <strong>INSERCIÓN PERMITIDA</strong>
            </div>
            <p class="text-090 opacity-90">El cliente <strong>ID=${val}</strong> existe en la tabla CLIENTES. Access permite crear el pedido porque la relación es íntegra: cada pedido (hijo) tiene un cliente (padre) real.</p>
          </div>`;
      } else {
        demoRow.className = 'error-row shake';
        demoFoot.innerHTML = '<span class="text-danger">❌ ID no encontrado</span>';
        result.className = 'integrity-result error';
        result.innerHTML = `
          <div class="flex flex-col gap-8">
            <div class="flex items-center gap-10">
              <span class="integrity-icon">❌</span> 
              <strong>BLOQUEO DE INTEGRIDAD</strong>
            </div>
            <p class="text-090 opacity-90">No existe el cliente <strong>ID=${val}</strong>. Access bloquea la operación para evitar un <strong>"registro huérfano"</strong>. Si se permitiera, tendríamos un pedido de alguien que no existe, dañando la base de datos.</p>
          </div>`;
        setTimeout(() => demoRow.classList.remove('shake'), 600);
      }
      result.style.display = 'flex';
    }, 800);
  });

  // --- TOUR LOGIC ---
  const tourSteps = [
    { el: '#relations-canvas', title: '🏗️ El Canvas de Diseño', text: 'Aquí ves tus tablas como en Access. Ahora puedes **arrastrarlas** desde su encabezado para organizar tu diagrama.' },
    { el: '#rel-cli', title: '👤 Tabla Maestra (Padre)', text: 'Esta tabla contiene los datos principales. Nota la llave 🔑 en ID_CLIENTE.' },
    { el: '#rel-ped', title: '🛒 Tabla Relacionada (Hijo)', text: 'Aquí el ID_CLIENTE tiene un eslabón 🔗. Indica que este campo "mira" hacia la tabla de Clientes.' },
    { el: '.integrity-demo', title: '🔒 Prueba de Fuego', text: 'En este panel simulamos qué pasa cuando intentas romper las reglas. ¡Prueba con los IDs que te sugerimos abajo!' }
  ];

  let currentStep = 0;
  function showStep(idx) {
    $$('.tour-popover').forEach(p => p.remove());
    $$('.tour-highlight').forEach(h => h.classList.remove('tour-highlight'));

    if (idx >= tourSteps.length) return;

    const step = tourSteps[idx];
    const target = $(step.el);
    if (!target) return;

    target.classList.add('tour-highlight');
    const rect = target.getBoundingClientRect();

    const pop = document.createElement('div');
    pop.className = 'tour-popover';
    pop.innerHTML = `
      <h4>${step.title}</h4>
      <p>${step.text}</p>
      <div class="tour-btns">
        <span class="text-11 text-text-3">Paso ${idx + 1} de ${tourSteps.length}</span>
        <button class="btn btn-xs btn-primary">${idx === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente →'}</button>
      </div>
    `;

    document.body.appendChild(pop);

    // Position popover
    const pR = pop.getBoundingClientRect();
    let top = rect.bottom + 10;
    let left = rect.left + (rect.width / 2) - (pR.width / 2);

    if (top + pR.height > window.innerHeight) top = rect.top - pR.height - 10;
    left = Math.max(10, Math.min(left, window.innerWidth - pR.width - 10));

    pop.style.top = top + 'px';
    pop.style.left = left + 'px';

    pop.querySelector('button').onclick = () => {
      currentStep++;
      if (currentStep < tourSteps.length) showStep(currentStep);
      else {
        pop.remove();
        target.classList.remove('tour-highlight');
      }
    };
  }

  $('#start-sim-tour')?.addEventListener('click', () => {
    currentStep = 0;
    showStep(0);
  });
}

/* ─── MÓDULO 2: SIMULADOR QBE ─── */
function initQBESimulator() {
  const container = $('#qbe-simulator');
  if (!container) return;
  container.innerHTML = `
    <div class="simulator-container">
      <div class="sim-header"><h3>🎮 Constructor QBE</h3><p>Selecciona campos y condiciones. El SQL se genera automáticamente.</p></div>
      <div class="qbe-builder">
        <div style="margin-bottom:16px">
          <label class="builder-label">Tipo de JOIN:</label>
          <select id="join-type" class="field-select" style="width:auto;margin-left:12px">
            <option value="INNER">INNER JOIN (solo coincidencias)</option>
            <option value="LEFT">LEFT JOIN (todos los de la izquierda)</option>
          </select>
        </div>
        <div style="margin-bottom:12px;font-size:0.9rem;color:var(--c-text-2)">Campos a mostrar:</div>
        <div id="qbe-fields" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px">
          ${[['Nombre', 'CLIENTES'], ['Ciudad', 'CLIENTES'], ['NIT', 'CLIENTES'], ['ID_PEDIDO', 'PEDIDOS'], ['Monto', 'PEDIDOS'], ['FechaPedido', 'PEDIDOS']].map(([f, t]) => `
            <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;background:var(--c-bg);padding:6px 12px;border-radius:8px;border:1px solid var(--c-border);cursor:pointer">
              <input type="checkbox" class="qbe-field-chk" data-field="${f}" data-table="${t}"> <strong>${t}.</strong>${f}
            </label>`).join('')}
        </div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
          <label class="builder-label">Filtro (Condición WHERE):</label>
          <select id="qbe-where-field" class="field-select" style="width:auto"><option>Monto</option><option>Ciudad</option><option>FechaPedido</option></select>
          <select id="qbe-where-op" class="field-select" style="width:auto"><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option></select>
          <input id="qbe-where-val" class="builder-input" style="width:120px" placeholder="500000">
          <button class="btn btn-sm btn-accent" id="qbe-run">Generar SQL</button>
        </div>
        <div class="sql-preview" id="qbe-sql-preview" hidden>
          <div class="sql-header"><span class="sql-badge">SQL Generado</span></div>
          <pre class="sql-code" id="qbe-sql-out"></pre>
        </div>
      </div>
    </div>`;

  $('#qbe-run')?.addEventListener('click', () => {
    const join = $('#join-type')?.value;
    const fields = $$('.qbe-field-chk:checked').map(c => `  ${c.dataset.table}.${c.dataset.field}`);
    if (!fields.length) { toast('Selecciona al menos un campo', 'error'); return; }
    const wField = $('#qbe-where-field')?.value;
    const wOp = $('#qbe-where-op')?.value;
    const wVal = $('#qbe-where-val')?.value;
    const numericFields = ['Monto', 'ID_PEDIDO'];
    const valStr = numericFields.includes(wField) ? wVal : `'${wVal}'`;
    const sql = `SELECT\n${fields.join(',\n')}\nFROM\n  CLIENTES AS C\n  ${join} JOIN PEDIDOS AS P\n    ON C.ID_CLIENTE = P.ID_CLIENTE${wVal ? `\nWHERE\n  ${wField} ${wOp} ${valStr}` : ''}\nORDER BY\n  C.Nombre ASC;`;
    const out = $('#qbe-sql-out');
    const prev = $('#qbe-sql-preview');
    if (out) out.textContent = sql;
    if (prev) prev.hidden = false;
    toast('SQL generado correctamente', 'success');
  });
}

/* ─── MÓDULO 2: JOINS VISUAL ─── */
function initJoinsVisual() {
  const container = $('#joins-visual');
  if (!container) return;
  const data = {
    clientes: [
      { id: 1, nombre: 'Ana García', ciudad: 'Bogotá' },
      { id: 2, nombre: 'Carlos Pérez', ciudad: 'Medellín' },
      { id: 3, nombre: 'Diana López', ciudad: 'Cali' },
    ],
    pedidos: [
      { id: 1, id_cli: 1, monto: 850000 },
      { id: 2, id_cli: 2, monto: 320000 },
      { id: 3, id_cli: 1, monto: 1200000 },
    ]
  };
  function renderTable(rows, cols, title, icon) {
    return `<div class="etl-table-wrapper"><div class="etl-table-title">${icon} ${title}</div>
    <table class="etl-data-table"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c] ?? '-'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function renderJoin(type) {
    let rows = [];
    if (type === 'INNER') {
      data.pedidos.forEach(p => {
        const c = data.clientes.find(cl => cl.id === p.id_cli);
        if (c) rows.push({ nombre: c.nombre, ciudad: c.ciudad, monto: '$' + p.monto.toLocaleString() });
      });
    } else {
      data.clientes.forEach(c => {
        const peds = data.pedidos.filter(p => p.id_cli === c.id);
        if (peds.length) peds.forEach(p => rows.push({ nombre: c.nombre, ciudad: c.ciudad, monto: '$' + p.monto.toLocaleString() }));
        else rows.push({ nombre: c.nombre, ciudad: c.ciudad, monto: 'NULL' });
      });
    }
    return rows;
  }
  container.innerHTML = `
    <div class="simulator-container">
      <div class="sim-header"><h3>🔗 Simulador Visual de Joins</h3><p>Observa en tiempo real qué registros devuelve cada tipo de JOIN.</p></div>
      <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
        <button class="btn btn-sm btn-primary" id="btn-inner">INNER JOIN</button>
        <button class="btn btn-sm btn-ghost" id="btn-left">LEFT JOIN</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px" id="join-source-tables">
        ${renderTable(data.clientes, ['id', 'nombre', 'ciudad'], 'CLIENTES', '👥')}
        ${renderTable(data.pedidos, ['id', 'id_cli', 'monto'], 'PEDIDOS', '🛒')}
      </div>
      <div id="join-result-title" style="font-size:0.9rem;font-weight:700;color:var(--c-primary);margin-bottom:10px">⬇ Resultado INNER JOIN</div>
      <div id="join-result"></div>
    </div>`;

  function showJoin(type) {
    const rows = renderJoin(type);
    $('#join-result').innerHTML = renderTable(rows, ['nombre', 'ciudad', 'monto'], `Resultado ${type} JOIN`, '📋');
    $('#join-result-title').textContent = `⬇ Resultado ${type} JOIN`;
    $$('#joins-visual .btn').forEach(b => b.classList.remove('btn-primary'));
    $$('#joins-visual .btn').forEach(b => b.classList.add('btn-ghost'));
    $(`#btn-${type.toLowerCase()}`).classList.replace('btn-ghost', 'btn-primary');
  }
  showJoin('INNER');
  $('#btn-inner')?.addEventListener('click', () => showJoin('INNER'));
  $('#btn-left')?.addEventListener('click', () => showJoin('LEFT'));
}

/* ─── MÓDULO 3: ETL SIMULATOR ─── */
function initETLSimulator() {
  const container = $('#etl-simulator');
  if (!container) return;
  const dirtyData = [
    { nombre: '  ana garcia ', fecha: '15/03/2024', telefono: '3001234567', activo: 'si' },
    { nombre: 'CARLOS PEREZ', fecha: '2024-03-20', telefono: '310  4567', activo: 'NO' },
    { nombre: 'ana garcia ', fecha: '15/03/2024', telefono: '3001234567', activo: 'si' },
    { nombre: 'diana lopez', fecha: '25-3-2024', telefono: '3204567890', activo: 'yes' },
    { nombre: '', fecha: '01/04/2024', telefono: '', activo: 'si' },
  ];
  let cleanData = JSON.parse(JSON.stringify(dirtyData));
  const log = [];
  let txDone = STATE.progress['etl-tx-done'] || { trim: false, dup: false, date: false, bool: false, empty: false };

  // Restore clean data based on persisted txDone
  if (txDone.trim) cleanData = cleanData.map(r => ({ ...r, nombre: r.nombre.trim().replace(/\s+/g, ' '), telefono: r.telefono.replace(/\s+/g, '') }));
  if (txDone.dup) {
    const seen = new Set();
    cleanData = cleanData.filter(r => { const k = r.nombre.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  if (txDone.date) cleanData = cleanData.map(r => ({ ...r, fecha: r.fecha.replace(/[-\/]/g, '/').split('/').map((p, i) => i < 2 ? p.padStart(2, '0') : p).join('/') }));
  if (txDone.bool) cleanData = cleanData.map(r => ({ ...r, activo: ['si', 'yes', 'true', '1'].includes(r.activo.toLowerCase()) ? 'TRUE' : 'FALSE' }));
  if (txDone.empty) cleanData = cleanData.filter(r => r.nombre && r.telefono);

  function renderTable(data, title, icon, dirty = false) {
    return `<div class="etl-table-wrapper">
      <div class="etl-table-title">${icon} ${title}</div>
      <table class="etl-data-table"><thead><tr><th>Nombre</th><th>Fecha</th><th>Teléfono</th><th>Activo</th></tr></thead>
      <tbody>${data.map(r => `<tr>
        <td class="${dirty && (r.nombre !== r.nombre.trim() || r.nombre === '') ? (r.nombre === '' ? 'cell-dirty' : 'cell-dirty') : 'cell-clean'}">${r.nombre || '<em style="color:var(--c-danger)">VACÍO</em>'}</td>
        <td>${r.fecha}</td>
        <td class="${dirty && r.telefono.includes('  ') ? 'cell-dirty' : ''}">${r.telefono || '<em style="color:var(--c-danger)">VACÍO</em>'}</td>
        <td>${r.activo}</td>
      </tr>`).join('')}</tbody></table></div>`;
  }

  function renderLog() {
    if (!log.length) return '';
    return `<div class="transform-log"><div class="transform-log-title">📋 Registro de Transformaciones</div>${log.map(l => `<div class="log-item"><span class="log-icon">✅</span><span>${l}</span></div>`).join('')}</div>`;
  }

  function renderProgress() {
    const pct = (Object.values(txDone).filter(v => v).length / 5) * 100;
    let feedbackParams = { msg: "Datos sucios identificados. Comienza a aplicar transformaciones paso a paso.", color: "var(--c-text-2)" };
    if (pct === 100) {
      feedbackParams = { msg: "¡Excelente! Has completado el proceso ETL correctamente. Los datos están listos para analizarse.", color: "var(--c-success)" };
    } else if (pct > 0) {
      feedbackParams = { msg: `¡Bien hecho! Llevas ${pct}% del proceso de limpieza. Continúa.`, color: "var(--c-primary)" };
    }

    return `
      <div class="etl-progress-container" style="margin-bottom: 25px; background: var(--c-surface2); padding: 18px; border-radius: 12px; border: 1px solid var(--c-border); backdrop-filter: blur(10px);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <span style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
             ${pct === 100 ? '✅' : '⏳'} Estado de Limpieza (Power Query)
           </span>
           <span style="font-size: 1.1rem; font-weight: 800; color: ${feedbackParams.color}; text-shadow: 0 0 10px ${feedbackParams.color}40;">${pct}%</span>
        </div>
        <div style="width: 100%; height: 10px; background: var(--c-bg); border-radius: 6px; overflow: hidden; margin-bottom: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
           <div style="height: 100%; width: ${pct}%; background: ${pct === 100 ? 'var(--c-success)' : 'var(--gradient-1)'}; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease; border-radius: 6px;"></div>
        </div>
        <div style="font-size: 0.9rem; color: ${pct === 100 ? 'var(--c-success)' : 'var(--c-text-2)'}; display: flex; align-items: center; gap: 8px; font-weight: 500;">
           <span>${pct === 100 ? '🎉' : '💡'}</span>
           ${feedbackParams.msg}
        </div>
      </div>
     `;
  }

  function render() {
    container.innerHTML = `
      <div class="simulator-container">
        <div class="sim-header"><h3>⚙ Simulador ETL – Power Query</h3><p>Aplica transformaciones paso a paso y observa cómo cambian los datos.</p></div>
        ${renderProgress()}
        <div class="etl-sim-grid">
          ${renderTable(dirtyData, 'Datos SUCIOS (Fuente)', '📥', true)}
          <div class="transform-controls">
            <span style="font-size:0.78rem;color:var(--c-text-2);font-weight:700;text-transform:uppercase">Aplicar Transformación</span>
            <button class="transform-btn" id="tx-trim" ${txDone.trim ? 'disabled style="opacity:0.5"' : ''}>${txDone.trim ? '✓' : '✂'} Eliminar espacios</button>
            <button class="transform-btn" id="tx-dup" ${txDone.dup ? 'disabled style="opacity:0.5"' : ''}>${txDone.dup ? '✓' : '🗑'} Quitar duplicados</button>
            <button class="transform-btn" id="tx-date" ${txDone.date ? 'disabled style="opacity:0.5"' : ''}>${txDone.date ? '✓' : '📅'} Normalizar fechas</button>
            <button class="transform-btn" id="tx-bool" ${txDone.bool ? 'disabled style="opacity:0.5"' : ''}>${txDone.bool ? '✓' : '✅'} Tipificar Activo</button>
            <button class="transform-btn" id="tx-empty" ${txDone.empty ? 'disabled style="opacity:0.5"' : ''}>${txDone.empty ? '✓' : '🚫'} Eliminar vacíos</button>
            <button class="btn btn-sm btn-ghost" id="tx-reset" style="margin-top: 10px;">↺ Resetear Todo</button>
          </div>
          ${renderTable(cleanData, 'Datos LIMPIOS (Destino)', '📤')}
        </div>
        ${renderLog()}
      </div>`;

    $('#tx-trim')?.addEventListener('click', () => {
      cleanData = cleanData.map(r => ({ ...r, nombre: r.nombre.trim().replace(/\s+/g, ' '), telefono: r.telefono.replace(/\s+/g, '') }));
      log.push('Espacios eliminados en Nombre y Teléfono'); txDone.trim = true;
      STATE.progress['etl-tx-done'] = txDone; saveProgress(); render();
    });
    $('#tx-dup')?.addEventListener('click', () => {
      const before = cleanData.length;
      const seen = new Set();
      cleanData = cleanData.filter(r => { const k = r.nombre.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
      log.push(`Duplicados eliminados: ${before - cleanData.length} filas removidas`); txDone.dup = true;
      STATE.progress['etl-tx-done'] = txDone; saveProgress(); render();
    });
    $('#tx-date')?.addEventListener('click', () => {
      cleanData = cleanData.map(r => ({ ...r, fecha: r.fecha.replace(/[-\/]/g, '/').split('/').map((p, i) => i < 2 ? p.padStart(2, '0') : p).join('/') }));
      log.push('Fechas normalizadas al formato DD/MM/YYYY'); txDone.date = true;
      STATE.progress['etl-tx-done'] = txDone; saveProgress(); render();
    });
    $('#tx-bool')?.addEventListener('click', () => {
      cleanData = cleanData.map(r => ({ ...r, activo: ['si', 'yes', 'true', '1'].includes(r.activo.toLowerCase()) ? 'TRUE' : 'FALSE' }));
      log.push('Campo Activo convertido a booleano (TRUE/FALSE)'); txDone.bool = true;
      STATE.progress['etl-tx-done'] = txDone; saveProgress(); render();
    });
    $('#tx-empty')?.addEventListener('click', () => {
      const before = cleanData.length;
      cleanData = cleanData.filter(r => r.nombre && r.telefono);
      log.push(`Filas incompletas eliminadas: ${before - cleanData.length} removidas`); txDone.empty = true;
      STATE.progress['etl-tx-done'] = txDone; saveProgress(); render();
    });
    $('#tx-reset')?.addEventListener('click', () => {
      cleanData = JSON.parse(JSON.stringify(dirtyData));
      log.length = 0;
      txDone = { trim: false, dup: false, date: false, bool: false, empty: false };
      STATE.progress['etl-tx-done'] = txDone;
      saveProgress();
      render(); toast('Datos y progreso restablecidos', 'info');
    });
  }
  render();
}

/* ─── MÓDULO 4: MODELO ESTRELLA ─── */
function initStarModel() {
  const container = $('#star-model-container');
  if (!container) return;
  container.innerHTML = `
    <div class="sim-header">
      <h3>⭐ Modelo Estrella Interactivo</h3>
      <p>El corazón del análisis en Power BI. Haz clic en cada tabla para explorar su rol y ver cómo se conecta.</p>
    </div>
    
    <div class="star-model-layout">
      <div class="star-canvas">
        <svg class="star-relations" id="star-svg-lines"></svg>
        
        <div class="star-table star-table--dim" style="grid-area:dim-fecha" id="st-fecha" data-rel="fecha">
          <div class="star-table-name">📅 DIM_FECHA</div>
          <ul class="star-table-fields"><li>🔑 ID_FECHA</li><li>Fecha</li><li>Año</li><li>Mes</li><li>Trimestre</li></ul>
        </div>
        
        <div class="star-table star-table--dim" style="grid-area:dim-prod" id="st-prod" data-rel="prod">
          <div class="star-table-name">📦 DIM_PRODUCTO</div>
          <ul class="star-table-fields"><li>🔑 ID_PRODUCTO</li><li>Nombre</li><li>Categoría</li><li>Precio</li></ul>
        </div>
        
        <div class="star-table star-table--fact" id="st-fact">
          <div class="star-table-name">⭐ FACT_VENTAS</div>
          <ul class="star-table-fields">
            <li class="fk-field" data-ref="fecha">🔗 ID_FECHA</li>
            <li class="fk-field" data-ref="prod">🔗 ID_PRODUCTO</li>
            <li class="fk-field" data-ref="cli">🔗 ID_CLIENTE</li>
            <li class="fk-field" data-ref="region">🔗 ID_REGION</li>
            <li>Cantidad</li>
            <li>Monto</li>
            <li>Descuento</li>
          </ul>
        </div>
        
        <div class="star-table star-table--dim" style="grid-area:dim-region" id="st-region" data-rel="region">
          <div class="star-table-name">🗺 DIM_REGION</div>
          <ul class="star-table-fields"><li>🔑 ID_REGION</li><li>Ciudad</li><li>Departamento</li><li>Zona</li></ul>
        </div>
        
        <div class="star-table star-table--dim" style="grid-area:dim-cliente" id="st-cli" data-rel="cli">
          <div class="star-table-name">👥 DIM_CLIENTE</div>
          <ul class="star-table-fields"><li>🔑 ID_CLIENTE</li><li>Nombre</li><li>Segmento</li><li>Ciudad</li></ul>
        </div>
      </div>

      <div class="star-sidebar">
        <div id="star-info" class="star-info-card">
          <div class="info-placeholder">
            <span class="info-pulse">👆</span>
            <p>Haz clic en una tabla para ver su rol en el diseño del modelo.</p>
          </div>
        </div>
        
        <div class="star-legend">
          <div class="legend-item"><span class="dot fact"></span> Hechos (Métricas)</div>
          <div class="legend-item"><span class="dot dim"></span> Dimensiones (Filtros)</div>
        </div>
      </div>
    </div>`;

  const info = {
    'st-fact': {
      title: '⭐ Tabla de Hechos (Fact Table)',
      desc: 'Es el centro del modelo. Contiene los datos cuantitativos o <strong>métricas</strong> (¿Cuánto se vendió?) y las <strong>llaves foráneas</strong> que conectan con las dimensiones.',
      details: 'En Gestión Administrativa, aquí guardarías cada registro de venta, pago de nómina o movimiento de inventario.'
    },
    'st-fecha': {
      title: '📅 Dimensión Fecha',
      desc: 'Permite analizar los datos en el tiempo (Día, Mes, Año). Sin ella, no podrías comparar el rendimiento de este mes vs el anterior.',
      details: 'Fundamental para reportes de ejecución presupuestal y tendencias de ventas.'
    },
    'st-prod': {
      title: '📦 Dimensión Producto',
      desc: 'Contiene los atributos descriptivos de lo que vendes. No cambian con cada venta (Nombre, Marca, Categoría).',
      details: 'Permite responder: ¿Qué categoría es la más rentable?'
    },
    'st-region': {
      title: '🗺 Dimensión Región',
      desc: 'Define la ubicación geográfica de los eventos. Organiza los datos por Ciudad, Sede o Departamento.',
      details: '¿Qué zona necesita más refuerzo comercial?'
    },
    'st-cli': {
      title: '👥 Dimensión Cliente',
      desc: 'Almacena la información de quién realiza la compra. Segmenta por tipo de cliente, edad o antigüedad.',
      details: 'Ideal para programas de fidelización y análisis de cartera.'
    }
  };

  const tables = $$('.star-table');
  const infoBox = $('#star-info');

  tables.forEach(el => {
    el.addEventListener('click', () => {
      // Reset
      tables.forEach(t => t.classList.remove('active'));
      $$('.fk-field').forEach(f => f.classList.remove('highlight'));

      // Set Active
      el.classList.add('active');
      const data = info[el.id];

      if (data) {
        infoBox.innerHTML = `
          <h4>${data.title}</h4>
          <p>${data.desc}</p>
          <div class="info-footer">${data.details}</div>
        `;
        infoBox.classList.add('reveal');
        setTimeout(() => infoBox.classList.remove('reveal'), 500);
      }

      // Highlight related fields in Fact table if it's a Dimension
      const relId = el.dataset.rel;
      if (relId) {
        $(`.fk-field[data-ref="${relId}"]`)?.classList.add('highlight');
      }
    });
  });
}

/* ─── MÓDULO 4: DASHBOARD ─── */
function initDashboard() {
  const container = $('#dashboard-builder');
  if (!container) return;
  const ventas = [
    { mes: 'Ene', valor: 42 }, { mes: 'Feb', valor: 58 }, { mes: 'Mar', valor: 51 },
    { mes: 'Abr', valor: 73 }, { mes: 'May', valor: 89 }, { mes: 'Jun', valor: 67 },
  ];
  const categorias = [
    { cat: 'Electrónica', pct: 38, color: '#39d0b8' },
    { cat: 'Ropa', pct: 25, color: '#5b6cff' },
    { cat: 'Hogar', pct: 22, color: '#a855f7' },
    { cat: 'Otros', pct: 15, color: '#f59e0b' },
  ];
  const maxVal = Math.max(...ventas.map(v => v.valor));
  const barColors = ['#39d0b8', '#5b6cff', '#a855f7', '#f59e0b', '#22c55e', '#ef4444'];

  let filtroMes = 'todos';
  function render() {
    const filtered = filtroMes === 'todos' ? ventas : ventas.filter(v => v.mes === filtroMes);
    const totalVentas = filtered.reduce((a, v) => a + v.valor * 5.5, 0).toFixed(0);
    container.innerHTML = `
      <div class="simulator-container">
        <div class="sim-header">
          <h3>📊 Dashboard Gerencial Interactivo</h3>
          <p>Simula un dashboard de Power BI. Usa el segmentador para filtrar datos.</p>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
          <span style="font-size:0.85rem;font-weight:700;color:var(--c-text-2)">🗓 Segmentador de Mes:</span>
          ${['todos', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map(m => `<button class="preset-btn" data-mes="${m}" style="${filtroMes === m ? 'border-color:var(--c-primary);color:var(--c-primary)' : ''}">${m === 'todos' ? 'Todos' : m}</button>`).join('')}
        </div>
        <div class="dash-grid">
          <!-- KPI Cards -->
          <div class="dash-widget">
            <div class="dash-widget-title">💰 Ventas Totales (M COP)</div>
            <div style="font-size:2.5rem;font-weight:900;background:var(--gradient-1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">$${(totalVentas / 1000).toFixed(0)}K</div>
            <div style="font-size:0.82rem;color:var(--c-success);margin-top:4px">↑ 12% vs periodo anterior</div>
          </div>
          <div class="dash-widget">
            <div class="dash-widget-title">📦 Pedidos</div>
            <div style="font-size:2.5rem;font-weight:900;color:var(--c-secondary)">${filtered.reduce((a, v) => a + v.valor, 0)}</div>
            <div style="font-size:0.82rem;color:var(--c-success);margin-top:4px">↑ 8% vs periodo anterior</div>
          </div>
          <!-- Bar Chart -->
          <div class="dash-widget" style="grid-column:span 2">
            <div class="dash-widget-title">📊 Ventas por Mes (Millones COP)</div>
            <div class="bar-chart" role="img" aria-label="Gráfico de barras de ventas por mes">
              ${ventas.map((v, i) => `<div class="bar-item">
                <div class="bar-fill" style="height:${(v.valor / maxVal) * 100}px;background:${barColors[i % barColors.length]};opacity:${filtroMes !== 'todos' && filtroMes !== v.mes ? '0.25' : '1'}"></div>
                <span class="bar-label">${v.mes}</span>
              </div>`).join('')}
            </div>
          </div>
          <!-- Donut -->
          <div class="dash-widget">
            <div class="dash-widget-title">🍩 Ventas por Categoría</div>
            <div class="donut-wrapper">
              <div class="donut-chart">
                <svg class="donut-svg" width="100" height="100" viewBox="0 0 100 100">
                  ${(() => { let offset = 0; return categorias.map(c => { const len = c.pct / 100 * 251.2; const el = `<circle cx="50" cy="50" r="40" fill="none" stroke="${c.color}" stroke-width="18" stroke-dasharray="${len} ${251.2 - len}" stroke-dashoffset="${-offset}" stroke-linecap="butt"/>`; offset += len; return el; }).join(''); })()}
                </svg>
              </div>
              <div class="donut-legend">
                ${categorias.map(c => `<div class="legend-item"><div class="legend-dot" style="background:${c.color}"></div><span>${c.cat}: ${c.pct}%</span></div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>`;

    $$('[data-mes]').forEach(btn => btn.addEventListener('click', () => { filtroMes = btn.dataset.mes; render(); }));
  }
  render();
}

/* ─── QUIZZES ─── */
const QUIZZES = {
  1: [
    { q: '¿Qué es una llave primaria en Access?', opts: ['Un campo que puede repetirse', 'Un identificador único e irrepetible por registro', 'El primer campo de la tabla siempre', 'Una relación entre tablas'], correct: 1, exp: 'La llave primaria (PK) identifica de forma única cada registro. Nunca puede tener valores duplicados ni nulos.' },
    { q: '¿Qué tipo de dato usarías para almacenar el precio de un producto?', opts: ['Texto corto', 'Sí/No', 'Moneda', 'Hipervínculo'], correct: 2, exp: 'El tipo Moneda en Access almacena valores monetarios con hasta 4 decimales y evita errores de redondeo.' },
    { q: '¿Qué garantiza la integridad referencial?', opts: ['Que los campos no puedan estar vacíos', 'Que no existan datos huérfanos entre tablas relacionadas', 'Que todos los registros sean únicos', 'Que las tablas no puedan borrarse'], correct: 1, exp: 'La integridad referencial asegura que si agregas un pedido con ID_CLIENTE=5, ese cliente debe existir en la tabla CLIENTES.' },
  ],
  2: [
    { q: '¿Qué devuelve un INNER JOIN?', opts: ['Todos los registros de las dos tablas', 'Solo los registros que coinciden en ambas tablas', 'Solo los registros de la tabla izquierda', 'Solo los registros sin coincidencia'], correct: 1, exp: 'INNER JOIN devuelve únicamente las filas que tienen coincidencia en ambas tablas según la condición ON.' },
    { q: 'En Access, ¿cómo se llama la interfaz visual para crear consultas sin escribir SQL?', opts: ['Visual Studio', 'QBE (Query By Example)', 'Power Query Editor', 'Formula Bar'], correct: 1, exp: 'QBE (Query By Example) es la cuadrícula de diseño visual de Access donde arrastras campos y defines condiciones.' },
    { q: '¿Cuál es la diferencia entre WHERE y HAVING en SQL?', opts: ['No hay diferencia', 'WHERE filtra filas antes de agrupar; HAVING filtra grupos', 'HAVING filtra filas; WHERE filtra grupos', 'Son sinónimos en Access'], correct: 1, exp: 'WHERE actúa sobre filas individuales antes de GROUP BY. HAVING actúa sobre los grupos resultantes.' },
  ],
  3: [
    { q: '¿Qué significa ETL?', opts: ['Enter, Type, Load', 'Extract, Transform, Load', 'Edit, Test, Launch', 'Export, Transfer, Link'], correct: 1, exp: 'ETL = Extract (extraer de la fuente), Transform (limpiar/calcular), Load (cargar al destino para análisis).' },
    { q: '¿En qué herramienta de Microsoft se realiza el proceso ETL sin programación?', opts: ['Excel Macros', 'Access VBA', 'Power Query', 'SQL Server Management Studio'], correct: 2, exp: 'Power Query es el motor ETL integrado en Excel y Power BI, diseñado para transformar datos sin código.' },
    { q: '¿Cuál es el primer paso del ETL?', opts: ['Transformar los datos', 'Cargar al modelo', 'Extraer de la fuente original', 'Crear el dashboard'], correct: 2, exp: 'Extract: conectarse a la fuente de datos (CSV, Excel, base de datos, web) y traer los datos hacia Power Query.' },
  ],
  4: [
    { q: '¿Qué tabla está en el centro del modelo estrella?', opts: ['Tabla de Dimensión', 'Tabla de Hechos (Fact Table)', 'Tabla de Configuración', 'Tabla de Usuarios'], correct: 1, exp: 'La Tabla de Hechos contiene las transacciones del negocio (ventas, pedidos) y las métricas numéricas.' },
    { q: '¿Para qué sirve una Tabla de Dimensión?', opts: ['Almacenar las transacciones', 'Proporcionar contexto descriptivo a los hechos', 'Calcular totales automáticos', 'Conectar con Internet'], correct: 1, exp: 'Las dimensiones (Cliente, Producto, Fecha, Región) describen el QUIÉN, QUÉ, CUÁNDO y DÓNDE de cada transacción.' },
    { q: '¿Qué es un KPI en Power BI?', opts: ['Un tipo de tabla', 'Un lenguaje de programación', 'Un indicador clave de rendimiento con meta definida', 'Un conector de base de datos'], correct: 2, exp: 'KPI (Key Performance Indicator) es una métrica de negocio comparada contra un objetivo. Ej: Ventas Reales vs Meta de Ventas.' },
  ],
};

function initQuiz(moduleNum) {
  const container = $(`#quiz-m${moduleNum}`);
  if (!container) return;
  const questions = QUIZZES[moduleNum];
  let current = 0, score = 0, answered = false;

  function render() {
    if (current >= questions.length) {
      const pct = Math.round((score / questions.length) * 100);
      container.innerHTML = `
        <div class="quiz-score">
          <div class="quiz-score-number">${pct}%</div>
          <div class="quiz-score-label">${score} de ${questions.length} correctas</div>
          <p style="margin:16px 0;color:var(--c-text-2)">${pct >= 70 ? '¡Excelente trabajo! Módulo dominado.' : 'Repasa el contenido y vuelve a intentarlo.'}</p>
          <button class="btn btn-primary" id="quiz-retry">↺ Reintentar</button>
        </div>`;
      if (pct >= 70) {
        STATE.progress[`quiz-m${moduleNum}-done`] = true;
        saveProgress();
        toast(`¡Módulo ${moduleNum} completado! 🎉`, 'success');
      }
      $('#quiz-retry')?.addEventListener('click', () => { current = 0; score = 0; render(); });
      return;
    }

    const q = questions[current];
    answered = false;
    container.innerHTML = `
      <div class="quiz-question">${current + 1}. ${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((o, i) => `<button class="quiz-option" data-idx="${i}" role="option">
          <span class="option-letter">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}
      </div>
      <div class="quiz-feedback" id="quiz-fb"></div>
      <div class="quiz-nav">
        <button class="btn btn-sm btn-ghost" id="quiz-skip" disabled>Siguiente →</button>
        <span class="quiz-counter">Pregunta ${current + 1} de ${questions.length}</span>
      </div>`;

    $$('.quiz-option', container).forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const idx = parseInt(btn.dataset.idx);
        const fb = $('#quiz-fb', container);
        $$('.quiz-option', container).forEach(b => b.classList.add('disabled'));
        if (idx === q.correct) {
          btn.classList.add('correct', 'correct-answer'); score++;
          if (fb) { fb.className = 'quiz-feedback correct show'; fb.innerHTML = `✅ <strong>¡Correcto!</strong> ${q.exp}`; }
        } else {
          btn.classList.add('wrong', 'incorrect-answer');
          $$('.quiz-option', container)[q.correct].classList.add('correct');
          if (fb) { fb.className = 'quiz-feedback wrong show'; fb.innerHTML = `❌ <strong>Incorrecto.</strong> ${q.exp}`; }
        }
        const skipBtn = $('#quiz-skip', container);
        if (skipBtn) { skipBtn.disabled = false; skipBtn.addEventListener('click', () => { current++; render(); }); }
      });
    });
  }
  render();
}

/* ─── PROGRESO DE GUÍAS PRÁCTICAS (todos los módulos) ─── */
function initGuideProgress() {
  const guideTotals = {
    m1: 20,
    msql: 5,
    m2: 12,
    m3: 12,
    m4: 12,
    m4b: 5,
    m4drv: 5,
    m5: 8,
    m5drv: 2,
    m6: 8, // Nuevo: Proyecto Integrador - Parte 1
    m7: 8, // Nuevo: Proyecto Integrador - Parte 2
    m8: 8, // Nuevo: Proyecto Integrador - Parte 3
    m9: 8, // Nuevo: Proyecto Integrador - Parte 4
    m10: 8, // Nuevo: Proyecto Integrador - Parte 5
    m11: 8, // Nuevo: Proyecto Integrador - Parte 6
    m12: 8, // Nuevo: Proyecto Integrador - Parte 7
    m13: 8, // Nuevo: Proyecto Integrador - Parte 8
  };

  const guides = [
    {
      module: 1,
      selector: '#m1-practica .guide-chk, #m1-entregables .guide-chk',
      total: guideTotals.m1,
      barId: 'guide-bar-fill',
      labelId: 'guide-pct',
      color: null,
      toastMsg: '🎉 ¡Guía de Access completada! Dominas tablas y relaciones.'
    },
    {
      module: 'sql',
      selector: '#msql-practica .guide-chk',
      total: guideTotals.msql,
      barId: null,
      labelId: null,
      color: 'linear-gradient(90deg,#2ecc71,#27ae60)',
      toastMsg: '🎉 ¡SQL Puro completado! Ya dominas SELECT, FROM y WHERE nativo.'
    },
    {
      module: 2,
      selector: '#m2-practica .guide-chk',
      total: guideTotals.m2,
      barId: 'guide-bar-fill-m2',
      labelId: 'guide-pct-m2',
      color: 'linear-gradient(90deg,#5b6cff,#a855f7)',
      toastMsg: '🎉 ¡Guía QBE completada! Ya sabes crear consultas con INNER JOIN.'
    },
    {
      module: 3,
      selector: '#m3-practica .guide-chk',
      total: 12,
      barId: 'guide-bar-fill-m3',
      labelId: 'guide-pct-m3',
      color: 'linear-gradient(90deg,#39d0b8,#5b6cff)',
      toastMsg: '🎉 ¡Guía ETL completada! Tus datos están listos para análisis.'
    },
    {
      module: 4,
      selector: '#m4-practica .guide-chk',
      total: 12,
      barId: 'guide-bar-fill-m4',
      labelId: 'guide-pct-m4',
      color: 'linear-gradient(90deg,#f59e0b,#a855f7)',
      toastMsg: '🎉 ¡Guía Power BI completada! Dashboard gerencial listo.'
    },
    {
      module: '4b',
      selector: '#m4-entregables .guide-chk[data-guide^="b"]',
      total: 5,
      barId: 'guide-bar-fill-m4b',
      labelId: 'guide-pct-m4b',
      color: 'linear-gradient(90deg,#f59e0b,#4285F4)',
      toastMsg: '🎉 ¡Ejercicio RRHH completado! Dashboard de nómina listo para entregar.'
    },
    {
      module: '4drv',
      selector: '#m4-entregables .guide-chk[data-guide^="drv"]',
      total: 5,
      barId: 'guide-bar-fill-drv4',
      labelId: 'guide-pct-drv4',
      color: 'linear-gradient(90deg,#4285F4,#34a853)',
      toastMsg: '☁️ ¡Todos los entregables subidos a Google Drive! El instructor recibirá tu trabajo.',
      labelUnit: 'archivos'
    },
    {
      module: 5,
      selector: '#m5-practica .guide-chk',
      total: 8,
      barId: 'guide-bar-fill-m5',
      labelId: 'guide-pct-m5',
      color: 'linear-gradient(90deg,#00C6ff,#0072ff)',
      toastMsg: '🚀 ¡Módulo 5 Completado! Has dominado las relaciones N:M y el diseño relacional avanzado. ¡Felicidades, Experto!'
    },
    {
      module: '5drv',
      selector: '#m5-entregables .guide-chk',
      total: 4,
      barId: 'guide-bar-fill-drv5',
      labelId: 'guide-pct-drv5',
      color: 'linear-gradient(90deg,#34a853,#00C6ff)',
      toastMsg: '🎖️ ¡Auditoría Técnica Superada! Todos tus entregables cumplen con los estándares de calidad.',
      labelUnit: 'evidencias'
    },
  ];

  guides.forEach(cfg => {
    let toastShown = false;

    function update() {
      const checks = $$(cfg.selector);
      const checked = checks.filter(c => c.checked).length;
      const total = checks.length || cfg.total;
      const pct = Math.round((checked / total) * 100);
      const bar = $(`#${cfg.barId}`);
      const label = $(`#${cfg.labelId}`);

      // Guardar progreso en STATE
      const checkedIds = checks.filter(c => c.checked).map(c => c.dataset.guide);
      STATE.progress[`m${cfg.module}-ids`] = checkedIds;
      STATE.progress[`m${cfg.module}-steps`] = checkedIds.length;
      saveProgress();

      if (bar) {
        bar.style.width = pct + '%';
        bar.style.background = pct === 100
          ? 'var(--c-success)'
          : (cfg.color || 'var(--gradient-1)');
      }
      if (label) label.textContent = `${checked} / ${total} ${cfg.labelUnit || 'pasos'}`;
      if (pct === 100 && !toastShown) {
        toastShown = true;
        toast(cfg.toastMsg, 'success');
      }
      if (pct < 100) toastShown = false;
    }

    $$(cfg.selector).forEach(chk => {
      // Restaurar estado desde STATE
      const savedIds = STATE.progress[`m${cfg.module}-ids`] || [];
      const gid = chk.dataset.guide;
      if (gid && savedIds.includes(gid)) {
        chk.checked = true;
      }
      chk.addEventListener('change', update);
    });
    update(); // inicializar al cargar
  });
}

/* ─── SVG GRADIENT DEFS (progreso ring) ─── */
function injectSVGDefs() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = `<defs><linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#39d0b8"/><stop offset="100%" stop-color="#5b6cff"/></linearGradient></defs>`;
  document.body.prepend(svg);
}

/* ─── MÓDULO 3: TRANSFORM LAB (Power Query Advanced) ─── */
function initTransformLab() {
  const container = $('#transform-lab');
  if (!container) return;

  const INITIAL_DATA = [
    { ID: 101, Empleado: "Pérez, Juan", Departamento: "VENTAS-BOG", Sueldo: 1200000 },
    { ID: 102, Empleado: "Gómez, Maria", Departamento: "MKT-MED", Sueldo: 1500000 },
    { ID: 103, Empleado: "López, Luis", Departamento: "VENTAS-CALI", Sueldo: 1100000 },
    { ID: 104, Empleado: "Ruiz, Ana", Departamento: "RRHH-BOG", Sueldo: 1800000 },
  ];

  let steps = STATE.progress['lab-steps'] || [{ id: 'source', text: 'Origen (JSON)', icon: '📥' }];
  let currentData = JSON.parse(JSON.stringify(INITIAL_DATA));

  // Restore data based on steps
  steps.forEach(s => {
    if (s.id === 'split') {
      currentData = currentData.map(r => {
        const parts = r.Departamento ? r.Departamento.split('-') : [r.Area, r.Sede];
        const newR = { ...r };
        delete newR.Departamento;
        newR.Area = parts[0];
        newR.Sede = parts[1];
        return newR;
      });
    } else if (s.id === 'upper') {
      currentData = currentData.map(r => ({ ...r, Empleado: r.Empleado.toUpperCase() }));
    } else if (s.id === 'bonus') {
      currentData = currentData.map(r => ({ ...r, Bono: (r.Sueldo || 0) > 1300000 ? 150000 : 50000 }));
    }
  });

  function generateMCode() {
    let code = `<span class="m-keyword">let</span>\n  Origen = <span class="m-func">Json.Document</span>(<span class="m-str">"DATA_INTERNA"</span>),\n`;
    steps.slice(1).forEach((step, i) => {
      const prev = i === 0 ? "Origen" : `Paso${i}`;
      code += `  Paso${i + 1} = <span class="m-func">${step.mFunc || 'Transformar'}</span>(${prev}${step.mArgs || ''}),\n`;
    });
    const last = steps.length > 1 ? `Paso${steps.length - 1}` : "Origen";
    code += `<span class="m-keyword">in</span>\n  ${last}`;
    return code;
  }

  function render() {
    const cols = currentData.length > 0 ? Object.keys(currentData[0]) : [];

    container.innerHTML = `
      <div class="simulator-container">
        <div class="sim-header">
          <h3>🧪 Laboratorio de Transformaciones</h3>
          <p>Experimenta con acciones avanzadas de Power Query sobre datos de nómina.</p>
        </div>
        
        <div class="transform-lab-container">
          <!-- PANEL ACCIONES -->
          <div class="lab-panel" style="grid-area: actions">
            <div class="lab-panel-header">
              <span class="lab-panel-title">🛠 Acciones PQ</span>
            </div>
            <div class="lab-actions-list">
              <button class="lab-action-btn" id="lab-split"><i>✂️</i> Dividir Columna (Depto)</button>
              <button class="lab-action-btn" id="lab-upper"><i>UP</i> Mayúsculas (Nombre)</button>
              <button class="lab-action-btn" id="lab-bonus"><i>💰</i> Columna Condicional (Bono)</button>
              <button class="lab-action-btn" id="lab-reset" style="margin-top:auto; color:var(--c-warn)"><i>↺</i> Reiniciar Vista</button>
            </div>
          </div>

          <!-- PANEL PREVIEW -->
          <div class="lab-panel" style="grid-area: preview">
            <div class="lab-panel-header">
              <span class="lab-panel-title">👁 Vista Previa</span>
            </div>
            <div class="lab-preview-content">
              <table class="lab-table">
                <thead>
                  <tr>
                    ${cols.map(c => `<th><span class="col-header-type">${typeof currentData[0][c] === 'number' ? '123' : 'abc'}</span>${c}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${currentData.map(row => `<tr>${cols.map(c => `<td>${row[c]}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- PANEL PASOS -->
          <div class="lab-panel" style="grid-area: steps">
            <div class="lab-panel-header">
              <span class="lab-panel-title">📑 Pasos Aplicados</span>
            </div>
            <div class="lab-steps-list">
              ${steps.map(s => `
                <div class="applied-step">
                  <span class="applied-step-icon">${s.icon}</span>
                  <span class="applied-step-text">${s.text}</span>
                  ${s.id !== 'source' ? '<button class="remove-step">✕</button>' : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- M CODE -->
          <div class="m-code-panel">
            <div class="m-code-header">
              <span class="m-code-badge">Editor Avanzado (Lenguaje M)</span>
              <span style="font-size:0.7rem; color:var(--c-text-3)">Solo lectura</span>
            </div>
            <div class="m-code-box">
              <pre>${generateMCode()}</pre>
            </div>
          </div>
        </div>
      </div>
    `;

    // Listeners
    $('#lab-split')?.addEventListener('click', () => {
      if (steps.some(s => s.id === 'split')) return toast('Ya dividiste las columnas', 'info');
      currentData = currentData.map(r => {
        const parts = r.Departamento.split('-');
        const newR = { ...r };
        delete newR.Departamento;
        newR.Area = parts[0];
        newR.Sede = parts[1];
        return newR;
      });
      steps.push({ id: 'split', text: 'Columna dividida', icon: '✂️', mFunc: 'Table.SplitColumn', mArgs: ', "Depto", ...' });
      STATE.progress['lab-steps'] = steps; saveProgress();
      render();
    });

    $('#lab-upper')?.addEventListener('click', () => {
      currentData = currentData.map(r => ({ ...r, Empleado: r.Empleado.toUpperCase() }));
      steps.push({ id: 'upper', text: 'Texto en Mayúsculas', icon: 'UP', mFunc: 'Table.TransformColumns', mArgs: ', {"Empleado", Text.Upper}' });
      STATE.progress['lab-steps'] = steps; saveProgress();
      render();
    });

    $('#lab-bonus')?.addEventListener('click', () => {
      if (steps.some(s => s.id === 'bonus')) return;
      currentData = currentData.map(r => ({ ...r, Bono: r.Sueldo > 1300000 ? 150000 : 50000 }));
      steps.push({ id: 'bonus', text: 'Columna condicional agregada', icon: '💰', mFunc: 'Table.AddColumn', mArgs: ', "Bono", each if ...' });
      STATE.progress['lab-steps'] = steps; saveProgress();
      render();
    });

    $('#lab-reset')?.addEventListener('click', () => {
      currentData = JSON.parse(JSON.stringify(INITIAL_DATA));
      steps = [{ id: 'source', text: 'Origen (JSON)', icon: '📥' }];
      STATE.progress['lab-steps'] = steps; saveProgress();
      render();
      toast('Laboratorio reiniciado', 'info');
    });
  }

  render();
}

/* ─── INIT ─── */
function init() {
  injectSVGDefs();
  initSplash();
  initTheme();
  initNavActive();
  initParticles();
  initStatCounters();
  initTabs();
  initConceptCards();
  initTableBuilder();
  initRelationsCanvas();
  initQBESimulator();
  initJoinsVisual();
  initETLSimulator();
  initTransformLab();
  initStarModel();
  initDashboard();
  initSQLSimulator();
  initMiniTabs();
  [1, 2, 3, 4].forEach(initQuiz);
  initGuideProgress();
  initScrollToTop();
  initGuideAnimations();
  updateGlobalProgress();
}

function initScrollToTop() {
  const btn = $('#scroll-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initGuideAnimations() {
  const steps = $$('.guide-step');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-step', 'active');
        // Quitar delay después de la primera animación para hover suave
        setTimeout(() => entry.target.style.transitionDelay = '0s', 600);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  steps.forEach((step, index) => {
    step.classList.add('reveal-step');
    step.style.transitionDelay = `${(index % 4) * 0.1}s`;
    observer.observe(step);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
});
