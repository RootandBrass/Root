# Root & Brass

Root & Brass is a personal Jekyll site for the house at 301 Ruby, the garden, kitchen, journal, and private grimoire.

## How the site works

- **GitHub** is the source of truth for site files and content.
- **Jekyll** builds the repository into `_site`.
- **Azure Static Web Apps** serves the built site and handles authentication for private areas.
- **Pages CMS** provides structured desktop editing through `.pages.yml`.
- **Crone** (`/crone/`) is the private mobile content editor. Its Azure Functions API writes structured entries and uploaded images back to GitHub.

## Public areas

The main site, 301 Ruby, Garden, Kitchen, History, and About pages are public.

## Protected areas

Azure Static Web Apps requires the `crone` role for:

- `/crone` and `/crone/*`
- `/journal` and `/journal/*`
- `/grimoire` and `/grimoire/*`
- `/api/crone/*`

Authentication and redirects are configured in `staticwebapp.config.json`.

## Content structure

### Garden
- Plant records: `garden/plants/`
- Seasonal records: `garden/seasonal/entries/`
- Garden projects: `garden/projects/entries/`
- Harvest & Use records: `garden/harvest/entries/`

### Kitchen
- Recipes: `kitchen/entries/`

### Journal
- Entries: `journal/entries/`

### Grimoire
Structured entries live under each section's `entries/` folder, including Apothecary, Crystals, Dreams, Moon, Recipes, Signs & Symbols, Spells, and Tarot.

## Layouts and CMS

Jekyll defaults in `_config.yml` assign layouts to structured entry folders. Pages CMS collections and fields are defined in `.pages.yml`. When adding a new structured content type, keep these four pieces aligned:

1. repository entry folder
2. `.pages.yml` collection
3. Jekyll rendering/defaults where needed
4. Crone/API content-type definition if mobile editing is desired

## Deployment

The GitHub Actions workflow `.github/workflows/azure-static-web-apps-blue-sea-0b6847910.yml` builds Jekyll and deploys `_site` to Azure Static Web Apps.

## Maintenance rule

For ordinary content additions, prefer Pages CMS or Crone instead of hand-editing generated/structured entry markup. Keep secrets such as the Crone GitHub token in Azure environment variables, never in repository files.
