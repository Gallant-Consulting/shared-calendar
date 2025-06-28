import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Link2, FileText, Plus, X, Building, MapPin, Tag } from 'lucide-react';
import type { Event, Tag as TagType } from '../types';
import { AVAILABLE_TAGS } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  onDelete?: () => void;
  initialData?: Event | null;
  selectedDate?: Date | null;
}

interface Attendee {
  name: string;
  avatar: string;
}

export function EventModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  initialData, 
  selectedDate 
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [repeatUntil, setRepeatUntil] = useState('');
  const [hostOrganization, setHostOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);

  // console.log('EventModal render:', { isOpen, selectedDate });

  useEffect(() => {
    // console.log('EventModal useEffect - initializing data');
    
    if (initialData) {
      setTitle(initialData.title);
      setStartDate(initialData.startDate.toISOString().split('T')[0]);
      setStartTime(initialData.startDate.toTimeString().slice(0, 5));
      setEndTime(initialData.endDate.toTimeString().slice(0, 5));
      setIsAllDay(initialData.isAllDay);
      setRepeatFrequency(initialData.repeat?.frequency || 'none');
      setRepeatUntil(initialData.repeat?.until ? initialData.repeat.until.toISOString().split('T')[0] : '');
      setHostOrganization(initialData.hostOrganization || '');
      setLocation(initialData.location || '');
      setLink(initialData.link || '');
      setNotes(initialData.notes || '');
      setAttendees(initialData.attendees);
      setSelectedTags(initialData.tags || []);
    } else {
      // Reset form for new event
      setTitle('');
      setStartDate(selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setIsAllDay(false);
      setRepeatFrequency('none');
      setRepeatUntil('');
      setHostOrganization('');
      setLocation('');
      setLink('');
      setNotes('');
      setAttendees([]);
      setNewAttendeeName('');
      setSelectedTags([]);
    }
  }, [initialData, selectedDate, isOpen]);

  const handleAddAttendee = () => {
    if (newAttendeeName.trim()) {
      setAttendees(prev => [...prev, { name: newAttendeeName.trim(), avatar: '' }]);
      setNewAttendeeName('');
    }
  };

  const handleRemoveAttendee = (index: number) => {
    setAttendees(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleTag = (tag: TagType) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'ESO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NETWORKING':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleSave = () => {
    // console.log('EventModal handleSave');
    
    const startDateTime = new Date(`${startDate}T${isAllDay ? '00:00' : startTime}`);
    const endDateTime = new Date(`${startDate}T${isAllDay ? '23:59' : endTime}`);
    
    const eventData: Omit<Event, 'id'> = {
      title: title || 'Untitled Event',
      startDate: startDateTime,
      endDate: endDateTime,
      isAllDay,
      attendees: attendees.length > 0 ? attendees : [{ name: 'You', avatar: '' }],
      repeat: repeatFrequency !== 'none' ? {
        frequency: repeatFrequency,
        until: repeatUntil ? new Date(repeatUntil) : undefined
      } : undefined,
      hostOrganization: hostOrganization || undefined,
      location: location || undefined,
      link: link || undefined,
      notes: notes || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    };

    onSave(eventData);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // console.log('Dialog onOpenChange:', open);
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl">
            {initialData ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription className="text-lg mt-2">
            {initialData ? 'Edit the details of your event' : 'Fill in the details to create a new event'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 pt-4 space-y-8">
          {/* Event Title */}
          <div className="space-y-3">
            <label htmlFor="title" className="block text-lg font-medium">
              Event Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title..."
              className="text-lg p-4 h-auto"
            />
          </div>

          {/* Date, Time, and Repeat */}
          <div className="space-y-4">
            <label className="block text-lg font-medium">
              When
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="block text-base font-medium text-muted-foreground">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-base p-3 h-auto"
                />
              </div>
              
              {!isAllDay && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="startTime" className="block text-base font-medium text-muted-foreground">
                      Start Time
                    </label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="text-base p-3 h-auto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="endTime" className="block text-base font-medium text-muted-foreground">
                      End Time
                    </label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-base p-3 h-auto"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                id="allDay"
                checked={isAllDay}
                onCheckedChange={setIsAllDay}
              />
              <label htmlFor="allDay" className="text-base">
                All day event
              </label>
            </div>

            {/* Repeat Options - Moved up here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="block text-base font-medium text-muted-foreground">
                  Repeat
                </label>
                <Select value={repeatFrequency} onValueChange={(value: 'none' | 'daily' | 'weekly' | 'monthly') => setRepeatFrequency(value)}>
                  <SelectTrigger className="text-base p-3 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Don't repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {repeatFrequency !== 'none' && (
                <div className="space-y-2">
                  <label htmlFor="repeatUntil" className="block text-base font-medium text-muted-foreground">
                    Until (Optional)
                  </label>
                  <Input
                    id="repeatUntil"
                    type="date"
                    value={repeatUntil}
                    onChange={(e) => setRepeatUntil(e.target.value)}
                    className="text-base p-3 h-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              <label className="text-lg font-medium">
                Tags (Optional)
              </label>
            </div>
            
            <div className="space-y-3">
              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag: TagType) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={`${getTagColor(tag)} px-3 py-1 text-sm font-medium cursor-pointer hover:opacity-80`}
                      onClick={() => handleToggleTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Available Tags */}
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.filter(tag => !selectedTags.includes(tag)).map((tag: TagType) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleTag(tag)}
                    className="text-sm h-auto px-3 py-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
              
              {selectedTags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Click to add tags to help categorize your event
                </p>
              )}
            </div>
          </div>

          {/* Host Organization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-500" />
              <label htmlFor="hostOrganization" className="text-lg font-medium">
                Host Organization (Optional)
              </label>
            </div>
            <Input
              id="hostOrganization"
              value={hostOrganization}
              onChange={(e) => setHostOrganization(e.target.value)}
              placeholder="Enter organizing company or group..."
              className="text-lg p-4 h-auto"
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <label htmlFor="location" className="text-lg font-medium">
                Location (Optional)
              </label>
            </div>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter venue or address..."
              className="text-lg p-4 h-auto"
            />
          </div>

          {/* Link */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-green-500" />
              <label htmlFor="link" className="text-lg font-medium">
                Link (Optional)
              </label>
            </div>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              className="text-lg p-4 h-auto"
            />
          </div>

          {/* Description/Notes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <label htmlFor="notes" className="text-lg font-medium">
                Description (Optional)
              </label>
            </div>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add event description or notes..."
              className="text-lg p-4 min-h-[100px] resize-y"
            />
          </div>

          {/* Attendees */}
          <div className="space-y-4">
            <label className="block text-lg font-medium">
              Attendees
            </label>
            
            {/* Current Attendees */}
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted rounded-full pl-1 pr-3 py-1">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-600 text-white text-sm">
                        {getInitials(attendee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-base">{attendee.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttendee(index)}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Attendee */}
            <div className="flex gap-2">
              <Input
                value={newAttendeeName}
                onChange={(e) => setNewAttendeeName(e.target.value)}
                placeholder="Add attendee name..."
                className="text-base p-3 h-auto"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAttendee();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAttendee}
                className="px-4 h-auto"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <Button 
              onClick={handleSave} 
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white text-lg px-8 py-3 h-auto"
            >
              {initialData ? 'Update Event' : 'Create Event'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="text-lg px-8 py-3 h-auto"
            >
              Cancel
            </Button>
            {onDelete && (
              <Button 
                variant="destructive" 
                onClick={onDelete}
                className="text-lg px-8 py-3 h-auto ml-auto"
              >
                Delete Event
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}