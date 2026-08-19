(() => {
  const cards = document.getElementById('cards');
  if (!cards || cards.dataset.organized === 'true') return;

  const buttons = Array.from(cards.querySelectorAll('.card'));
  if (!buttons.length) return;

  const byLabel = new Map();
  buttons.forEach(button => {
    const label = button.querySelector('strong')?.textContent?.trim();
    if (label) byLabel.set(label, button);
  });

  const groups = [
    {
      title: 'Root & Brass',
      subtitle: 'Main site pages',
      labels: ['Kitchen', 'Plant Journal']
    },
    {
      title: 'Grimoire',
      subtitle: 'Private grimoire pages · alphabetical',
      labels: ['Apothecary', 'Crystals', 'Dreams', 'Grimoire Recipes', 'Moon Journal', 'Signs & Symbols', 'Spells', 'Tarot']
    },
    {
      title: 'Journal',
      subtitle: 'Personal journal · kept last',
      labels: ['Journal']
    }
  ];

  const section = cards.closest('section');
  const oldHeading = section?.querySelector(':scope > .section-title');
  if (oldHeading) oldHeading.remove();

  cards.innerHTML = '';
  cards.className = 'crone-groups';
  cards.dataset.organized = 'true';

  const style = document.createElement('style');
  style.textContent = `
    .crone-groups{display:grid;gap:32px}
    .crone-group{display:grid;gap:12px}
    .crone-group-head{display:flex;align-items:end;justify-content:space-between;gap:16px;padding-bottom:9px;border-bottom:1px solid var(--line)}
    .crone-group-head h2{margin:0;color:var(--brass2);font-size:13px;font-weight:normal;letter-spacing:.2em;text-transform:uppercase}
    .crone-group-head p{margin:0;color:var(--muted);font-size:10px;letter-spacing:.08em;text-transform:uppercase;text-align:right}
    .crone-group-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}
    .crone-group.journal-group{margin-top:6px}
    @media(max-width:820px){.crone-group-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:520px){.crone-groups{gap:28px}.crone-group-grid{gap:8px}.crone-group-head{align-items:start;flex-direction:column;gap:3px}.crone-group-head p{text-align:left}}
  `;
  document.head.appendChild(style);

  groups.forEach(group => {
    const wrap = document.createElement('section');
    wrap.className = 'crone-group' + (group.title === 'Journal' ? ' journal-group' : '');

    const head = document.createElement('div');
    head.className = 'crone-group-head';
    head.innerHTML = `<h2>${group.title}</h2><p>${group.subtitle}</p>`;

    const grid = document.createElement('div');
    grid.className = 'crone-group-grid';

    group.labels.forEach(label => {
      const button = byLabel.get(label);
      if (button) grid.appendChild(button);
    });

    wrap.append(head, grid);
    cards.appendChild(wrap);
  });
})();
