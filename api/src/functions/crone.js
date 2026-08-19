const { app } = require('@azure/functions');

const OWNER = 'RootandBrass';
const REPO = 'Root';
const BRANCH = 'main';
const API_VERSION = '2022-11-28';

const definitions = {
  journal: { dir: 'journal/entries', dated: true, bodyField: 'body', required: ['date'] },
  moon: { dir: 'grimoire/moon/entries', datedTitle: true, required: ['title', 'date', 'phase'] },
  kitchen: { dir: 'kitchen/entries', titleOnly: true, bodyField: 'recipe', required: ['title', 'category', 'recipe'] },
  apothecary: { dir: 'grimoire/apothecary/entries', titleOnly: true, required: ['title'] },
  crystals: { dir: 'grimoire/crystals/entries', titleOnly: true, required: ['title'] },
  tarot: { dir: 'grimoire/tarot/entries', datedTitle: true, required: ['title', 'date'] },
  dreams: { dir: 'grimoire/dreams/entries', datedTitle: true, required: ['title', 'date'], bodyField: 'body' },
  spells: { dir: 'grimoire/spells/entries', datedTitle: true, required: ['title', 'date'] },
  grimoireRecipes: { dir: 'grimoire/recipes/entries', datedTitle: true, required: ['title', 'date', 'category'] },
  signs: { dir: 'grimoire/signs-symbols/entries', titleOnly: true, required: ['title', 'category'] }
};

const plantDirs = {
  treesandshrubs: 'garden/plants/treesandshrubs',
  flowers: 'garden/plants/flowers',
  climbers: 'garden/plants/climbers',
  edibles: 'garden/plants/edibles'
};

function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'entry';
}

function yamlValue(value) {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const text = String(value).replace(/\r\n/g, '\n');
  if (text.includes('\n')) {
    return '|-\n' + text.split('\n').map(line => `  ${line}`).join('\n');
  }
  return JSON.stringify(text);
}

function frontMatter(fields, bodyField) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (key === bodyField || key === 'plant_group' || value === '' || value === null || value === undefined) continue;
    if (!/^[a-zA-Z0-9_]+$/.test(key)) continue;
    lines.push(`${key}: ${yamlValue(value)}`);
  }
  lines.push('---', '');
  if (bodyField && fields[bodyField]) lines.push(String(fields[bodyField]).trim(), '');
  return lines.join('\n');
}

function clientPrincipal(request) {
  const raw = request.headers.get('x-ms-client-principal');
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

async function githubPut(path, bytes, token, message) {
  const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': 'Root-and-Brass-Crone'
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(bytes).toString('base64'),
      branch: BRANCH
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub ${response.status}: ${detail.slice(0, 500)}`);
  }
  return response.json();
}

function chooseDefinition(type, fields) {
  if (type === 'plant') {
    const group = fields.plant_group;
    const dir = plantDirs[group];
    if (!dir) throw new Error('Choose a plant group.');
    return { dir, titleOnly: true, extension: '.html', required: ['title', 'plant_type', 'bloom', 'light', 'water'] };
  }
  const def = definitions[type];
  if (!def) throw new Error('Unknown entry type.');
  return { extension: '.md', ...def };
}

function makeFilename(def, fields) {
  const date = fields.date || new Date().toISOString().slice(0, 10);
  const title = fields.title || date;
  if (def.dated) return `${date}${def.extension}`;
  if (def.datedTitle) return `${date}-${slugify(title)}${def.extension}`;
  return `${slugify(title)}${def.extension}`;
}

app.http('croneEntry', {
  route: 'crone/entry',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const principal = clientPrincipal(request);
    if (!principal || !Array.isArray(principal.userRoles) || !principal.userRoles.includes('crone')) {
      return { status: 403, jsonBody: { ok: false, error: 'Crone role required.' } };
    }

    const token = process.env.CRONE_GITHUB_TOKEN;
    if (!token) {
      return { status: 503, jsonBody: { ok: false, error: 'Crone is locked but not yet connected to its GitHub write key.' } };
    }

    try {
      const payload = await request.json();
      const type = payload.type;
      const fields = { ...(payload.fields || {}) };
      const def = chooseDefinition(type, fields);

      for (const key of def.required || []) {
        if (!fields[key]) return { status: 400, jsonBody: { ok: false, error: `${key} is required.` } };
      }

      if (payload.image && payload.image.data) {
        const rawName = payload.image.name || 'photo.jpg';
        const extMatch = rawName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);
        const ext = extMatch ? `.${extMatch[1]}` : '.jpg';
        const stem = slugify((fields.title || type) + '-' + Date.now());
        const imagePath = `images/uploads/${stem}${ext}`;
        const imageBytes = Buffer.from(String(payload.image.data).replace(/^data:[^;]+;base64,/, ''), 'base64');
        if (imageBytes.length > 8 * 1024 * 1024) {
          return { status: 413, jsonBody: { ok: false, error: 'Photo is too large. Keep uploads under 8 MB.' } };
        }
        await githubPut(imagePath, imageBytes, token, `Crone: upload ${fields.title || type} photo`);
        if (type === 'plant' || type === 'kitchen') fields.photo = `/${imagePath}`;
        else fields.image = `/${imagePath}`;
      }

      const filename = makeFilename(def, fields);
      const path = `${def.dir}/${filename}`;
      const content = frontMatter(fields, def.bodyField || 'body');
      const result = await githubPut(path, Buffer.from(content, 'utf8'), token, `Crone: add ${fields.title || type}`);

      context.log(`Crone created ${path} for ${principal.userDetails || principal.userId}`);
      return {
        status: 201,
        jsonBody: {
          ok: true,
          path,
          commit: result.commit && result.commit.sha,
          message: 'Saved to Root & Brass.'
        }
      };
    } catch (error) {
      context.error(error);
      const conflict = String(error.message || '').includes('GitHub 422');
      return {
        status: conflict ? 409 : 500,
        jsonBody: {
          ok: false,
          error: conflict ? 'An entry with that filename already exists. Change the title or date and try again.' : 'Crone could not save this entry.'
        }
      };
    }
  }
});

app.http('croneStatus', {
  route: 'crone/status',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request) => {
    const principal = clientPrincipal(request);
    const permitted = !!(principal && principal.userRoles && principal.userRoles.includes('crone'));
    return {
      status: permitted ? 200 : 403,
      jsonBody: {
        ok: permitted,
        connected: permitted && !!process.env.CRONE_GITHUB_TOKEN,
        user: permitted ? principal.userDetails : null
      }
    };
  }
});
