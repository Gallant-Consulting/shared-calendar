interface Settings {
  site_title: string;
  site_description: string;
  tags: string[];
  tag_labels: Record<string, string>;
  contact_email: string;
  footer_links: Array<{ text: string; url: string }>;
}


const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
const SETTINGS_API_PATH = `${API_BASE}/api/settings`;

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

function normalizeSettings(raw: Partial<Settings>): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    tags: Array.isArray(raw.tags) ? raw.tags : DEFAULT_SETTINGS.tags,
    tag_labels:
      raw.tag_labels && typeof raw.tag_labels === 'object'
        ? raw.tag_labels
        : DEFAULT_SETTINGS.tag_labels,
    footer_links: Array.isArray(raw.footer_links)
      ? raw.footer_links
      : DEFAULT_SETTINGS.footer_links,
  };
}

export async function getSettings(): Promise<Settings> {
  try {
    const response = await fetch(SETTINGS_API_PATH);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    const result = (await response.json()) as Partial<Settings>;
    return normalizeSettings(result);
  } catch (error) {
    console.warn('Failed to fetch settings from API, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(settings: Settings): Promise<void> {
  const response = await fetch(SETTINGS_API_PATH, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to update settings');
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