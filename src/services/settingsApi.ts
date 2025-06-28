interface Settings {
  site_title: string;
  site_description: string;
  tags: string[];
  tag_labels: Record<string, string>;
  contact_email: string;
  footer_links: Array<{ text: string; url: string }>;
}

const SETTINGS_SHEET_NAME = 'Settings';
const NOCODE_API_ENDPOINT = import.meta.env.VITE_NOCODE_API_ENDPOINT;

// Default settings if none are found
const DEFAULT_SETTINGS: Settings = {
  site_title: 'Central VA ESO Calendar',
  site_description: 'A shared calendar for ESO practitioners.',
  tags: ['ESO', 'PAID', 'NETWORKING'],
  tag_labels: {
    'ESO': 'ESO Event',
    'PAID': 'Paid Event',
    'NETWORKING': 'Networking Event'
  },
  contact_email: '',
  footer_links: [
    { text: 'Terms of Service', url: '#' },
    { text: 'Privacy Policy', url: '#' },
    { text: 'Cookie Policy', url: '#' }
  ]
};

// Parse settings from Google Sheets array format
function parseSettingsFromSheets(data: any[][]): Settings {
  const settings: Partial<Settings> = {};
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row.length >= 2) {
      const key = row[0]?.toString().trim();
      const value = row[1]?.toString().trim();
      if (key && value && key !== 'Key') { // skip header if present in any row
        switch (key) {
          case 'site_title':
            settings.site_title = value;
            break;
          case 'site_description':
            settings.site_description = value;
            break;
          case 'contact_email':
            settings.contact_email = value;
            break;
          case 'tags':
            settings.tags = value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
            break;
          case 'tag_labels':
            const tagLabels: Record<string, string> = {};
            value.split(',').forEach((pair: string) => {
              const [tag, label] = pair.split(':').map((s: string) => s.trim());
              if (tag && label) {
                tagLabels[tag] = label;
              }
            });
            settings.tag_labels = tagLabels;
            break;
          case 'footer_links':
            const footerLinks: Array<{ text: string; url: string }> = [];
            value.split(',').forEach((pair: string) => {
              const firstColonIndex = pair.indexOf(':');
              if (firstColonIndex > 0) {
                const text = pair.substring(0, firstColonIndex).trim();
                const url = pair.substring(firstColonIndex + 1).trim();
                if (text && url) {
                  footerLinks.push({ text, url });
                }
              }
            });
            settings.footer_links = footerLinks;
            break;
        }
      }
    }
  }
  return { ...DEFAULT_SETTINGS, ...settings };
}

// Convert settings to Google Sheets array format
function convertSettingsToSheets(settings: Settings): any[][] {
  const rows = [
    ['Key', 'Value', 'Type', 'Description'], // Header row
    ['site_title', settings.site_title, 'string', 'Main site heading'],
    ['site_description', settings.site_description, 'string', 'Site description for about modal'],
    ['contact_email', settings.contact_email, 'string', 'Contact email for site'],
    ['tags', settings.tags.join(','), 'array', 'Comma-separated list of available tags'],
    ['tag_labels', Object.entries(settings.tag_labels).map(([k, v]) => `${k}:${v}`).join(','), 'object', 'Tag display labels (key:value pairs)'],
    ['footer_links', settings.footer_links.map(link => `${link.text}:${link.url}`).join(','), 'array', 'Footer links (text:url pairs)']
  ];
  
  return rows;
}

export async function getSettings(): Promise<Settings> {
  try {
    if (!NOCODE_API_ENDPOINT) {
      throw new Error('NOCODE_API_ENDPOINT not configured');
    }

    const response = await fetch(`${NOCODE_API_ENDPOINT}?tabId=settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    
    const result = await response.json();
    
    // Handle the actual API response structure
    if (result && result.data && Array.isArray(result.data)) {
      // Convert the object array to the format our parser expects
      const dataArray = result.data.map((row: any) => [
        row.Key,
        row.Value,
        row.Type,
        row.Description
      ]);
      return parseSettingsFromSheets(dataArray);
    }
    
    throw new Error('Invalid data format from API');
  } catch (error) {
    console.warn('Failed to fetch settings from API, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(settings: Settings): Promise<void> {
  if (!NOCODE_API_ENDPOINT) {
    throw new Error('NOCODE_API_ENDPOINT not configured');
  }

  // 1. Fetch current rows
  const getResp = await fetch(`${NOCODE_API_ENDPOINT}?tabId=settings`);
  if (!getResp.ok) throw new Error('Failed to fetch current settings');
  const getResult = await getResp.json();
  const currentRows = Array.isArray(getResult.data) ? getResult.data : [];

  // 2. Prepare new settings as a map for easy lookup
  const newRows = convertSettingsToSheets(settings).slice(1); // skip header
  const newSettingsMap = new Map(newRows.map(row => [row[0], row]));

  // 3. Update or add each setting
  for (const row of newRows) {
    const key = row[0];
    const value = row[1];
    const type = row[2];
    const description = row[3];
    const existing = currentRows.find((r: any) => r.Key === key);
    if (existing) {
      // PUT to update
      await fetch(`${NOCODE_API_ENDPOINT}?tabId=settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row_id: existing.row_id,
          Key: key,
          Value: value,
          Type: type,
          Description: description
        })
      });
    } else {
      // POST to add
      await fetch(`${NOCODE_API_ENDPOINT}?tabId=settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([[key, value, type, description]])
      });
    }
  }

  // 4. Optionally, delete rows not in new settings
  for (const row of currentRows) {
    if (!newSettingsMap.has(row.Key) && row.row_id) {
      await fetch(`${NOCODE_API_ENDPOINT}?tabId=settings&row_id=${row.row_id}`, {
        method: 'DELETE'
      });
    }
  }
}

// For now, we'll use localStorage as a fallback until the API is implemented
export async function getSettingsLocal(): Promise<Settings> {
  try {
    const stored = localStorage.getItem('site_settings');
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettingsLocal(settings: Settings): Promise<void> {
  try {
    localStorage.setItem('site_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
    throw error;
  }
}

export { DEFAULT_SETTINGS };
export type { Settings }; 