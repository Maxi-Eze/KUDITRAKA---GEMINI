'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, MessageSquare } from 'lucide-react';
import type { ChatSession } from '@/lib/types';

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function SessionItem({ session, isActive, onSelect, onRename, onDelete }: SessionItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);

  const handleRename = () => {
    if (editTitle.trim()) {
      onRename(session.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
      onClick={() => onSelect(session.id)}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0" />
      
      {isEditing ? (
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') {
              setEditTitle(session.title);
              setIsEditing(false);
            }
          }}
          autoFocus
          className="flex-1 bg-transparent border-b border-current outline-none text-sm"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate text-sm">{session.title}</span>
      )}

      <div className="relative">
        <Button
          variant="ghost"
          size="icon-xs"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 z-50 w-32 rounded-lg border border-border bg-popover shadow-md py-1">
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setShowMenu(false);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Rename
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted text-destructive transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
                setShowMenu(false);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}