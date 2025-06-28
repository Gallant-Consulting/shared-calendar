import React from 'react';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface FloatingNewEventButtonProps {
  onClick: () => void;
}

export function FloatingNewEventButton({ onClick }: FloatingNewEventButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white rounded-full px-4 py-2 flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Submit event
    </Button>
  );
}