import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { X, Plus, Lock, Settings as SettingsIcon } from 'lucide-react';

interface Settings {
  site_title: string;
  site_description: string;
  tags: string[];
  tag_labels: Record<string, string>;
  contact_email: string;
  footer_links: Array<{ text: string; url: string }>;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => Promise<void>;
  currentSettings: Settings;
}

export function SettingsModal({ isOpen, onClose, onSave, currentSettings }: SettingsModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<Settings>(currentSettings);
  const [newTag, setNewTag] = useState('');
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newFooterLink, setNewFooterLink] = useState({ text: '', url: '' });
  const [saving, setSaving] = useState(false);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
      setIsAuthenticated(false);
      setPassword('');
      setError('');
    }
  }, [isOpen, currentSettings]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setIsLoading(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag && newTagLabel && !settings.tags.includes(newTag)) {
      setSettings(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
        tag_labels: { ...prev.tag_labels, [newTag]: newTagLabel }
      }));
      setNewTag('');
      setNewTagLabel('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
      tag_labels: Object.fromEntries(
        Object.entries(prev.tag_labels).filter(([tag]) => tag !== tagToRemove)
      )
    }));
  };

  const addFooterLink = () => {
    if (newFooterLink.text && newFooterLink.url) {
      setSettings(prev => ({
        ...prev,
        footer_links: [...prev.footer_links, newFooterLink]
      }));
      setNewFooterLink({ text: '', url: '' });
    }
  };

  const removeFooterLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      footer_links: prev.footer_links.filter((_, i) => i !== index)
    }));
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Access Required
            </DialogTitle>
            <DialogDescription>
              Enter the admin password to access site settings.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Access Settings
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Site Settings
          </DialogTitle>
          <DialogDescription>
            Manage site configuration and appearance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={settings.site_title}
                onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                placeholder="Enter site title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                placeholder="Enter site description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          {/* Tags Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Event Tags</h3>
            
            <div className="flex flex-wrap gap-2">
              {settings.tags.map(tag => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {settings.tag_labels[tag] || tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Tag name (e.g., ESO)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Input
                placeholder="Display label (e.g., ESO Event)"
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Footer Links</h3>
            
            <div className="space-y-2">
              {settings.footer_links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex-1">
                    {link.text} → {link.url}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFooterLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Link text (e.g., Terms of Service)"
                value={newFooterLink.text}
                onChange={(e) => setNewFooterLink(prev => ({ ...prev, text: e.target.value }))}
                className="flex-1"
              />
              <Input
                placeholder="URL (e.g., https://example.com/terms)"
                value={newFooterLink.url}
                onChange={(e) => setNewFooterLink(prev => ({ ...prev, url: e.target.value }))}
                className="flex-1"
              />
              <Button type="button" onClick={addFooterLink} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        
        {saving && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          </div>
        )}
        
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isLoading || saving} className="flex-1">
            {saving ? 'Saving...' : isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 