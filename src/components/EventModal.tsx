// src/components/EventModal.tsx
"use client";
// Needs client-side interaction

import { useState, useEffect } from "react";
import type { MyEvent } from "@/types/event"; // Adjust path if needed
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  eventData: Partial<MyEvent> | { start: Date; end: Date }; // Initial data for edit or slot info for add
  onSave: (event: MyEvent) => void;
  onDelete?: (eventId: string) => void; // Optional: only needed in edit mode
  onViewDetails?: (event: MyEvent) => void; // Optional: only needed in edit mode
}

// Helper to format Date to datetime-local string 'yyyy-MM-ddTHH:mm'
const formatDateTimeLocal = (date: Date | undefined): string => {
  if (!date) return "";
  try {
    // Adjust for timezone offset before formatting
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  } catch (e) {
    console.error("Error formatting date:", e);
    return "";
  }
};

// Helper to parse datetime-local string back to Date
const parseDateTimeLocal = (dateTimeStr: string): Date | null => {
  try {
    return new Date(dateTimeStr);
  } catch (e) {
    console.error("Error parsing date string:", e);
    return null;
  }
};


export function EventModal({
  isOpen,
  onClose,
  mode,
  eventData,
  onSave,
  onDelete,
  onViewDetails,
}: EventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startStr, setStartStr] = useState<string>("");
  const [endStr, setEndStr] = useState<string>("");
  const [currentEventId, setCurrentEventId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && eventData && 'title' in eventData) {
        // Editing existing event
        setTitle(eventData.title || "");
        setDescription(eventData.description || "");
        setStartStr(formatDateTimeLocal(eventData.start));
        setEndStr(formatDateTimeLocal(eventData.end));
        setCurrentEventId(eventData.id);
      } else if (mode === "add" && eventData && 'start' in eventData) {
        // Adding new event from slot
        setTitle("");
        setDescription("");
        setStartStr(formatDateTimeLocal(eventData.start));
        setEndStr(formatDateTimeLocal(eventData.end));
        setCurrentEventId(undefined);
      } else {
        // Default/Reset state if needed (e.g., opening add without slot info)
         setTitle("");
         setDescription("");
         const now = new Date();
         setStartStr(formatDateTimeLocal(now));
         // Default end time 1 hour later
         const endDefault = new Date(now.getTime() + 60 * 60 * 1000);
         setEndStr(formatDateTimeLocal(endDefault));
         setCurrentEventId(undefined);
      }
    }
  }, [isOpen, mode, eventData]);

  const handleSave = () => {
    const startDate = parseDateTimeLocal(startStr);
    const endDate = parseDateTimeLocal(endStr);

    if (!title || !startDate || !endDate) {
      alert("Please fill in title, start time, and end time.");
      return;
    }

    if (startDate >= endDate) {
        alert("End time must be after start time.");
        return;
    }

    const event: MyEvent = {
      id: mode === "edit" && currentEventId ? currentEventId : "BAD ID", // Use existing ID if editing, else generate new
      title,
      description,
      start: startDate,
      end: endDate,
    };
    onSave(event);
    onClose(); // Close modal after save
  };

  const handleDelete = () => {
    if (mode === 'edit' && currentEventId && onDelete) {
        onDelete(currentEventId);
        onClose(); // Close modal after delete confirmation
    }
  };

  const handleViewDetails = () => {
      if (mode === 'edit' && currentEventId && eventData && 'title' in eventData && onViewDetails) {
          // Reconstruct the event object cleanly before passing
          const startDate = parseDateTimeLocal(startStr);
          const endDate = parseDateTimeLocal(endStr);
          if (startDate && endDate) {
              const currentFullEvent: MyEvent = {
                id: currentEventId,
                title: title,
                description: description,
                start: startDate,
                end: endDate,
                allDay: eventData.allDay // Preserve original allDay if present
              };
              onViewDetails(currentFullEvent);
              onClose(); // Optionally close modal after viewing details
          } else {
              console.error("Cannot view details: Invalid date strings");
          }
      }
  };


  // Ensure Dialog closes when clicking outside or on the 'x'
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Event" : "Edit Event"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter the details for your new event."
              : "Make changes to your event here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">
              Start Time
            </Label>
            {/* NOTE: Using native datetime-local for simplicity.
                Replace with Shadcn Calendar + custom time input or a library
                like react-datepicker styled with Tailwind for better UX/consistency */}
            <Input
              id="start"
              type="datetime-local"
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end" className="text-right">
              End Time
            </Label>
            <Input
              id="end"
              type="datetime-local"
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between"> {/* Adjust footer layout */}
            <div className="flex gap-2">
                {mode === 'edit' && onViewDetails && (
                    <Button type="button" variant="outline" onClick={handleViewDetails}>
                        View Details
                    </Button>
                )}
                 {mode === 'edit' && onDelete && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the event.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 )}
            </div>
            <div className="flex gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleSave}>Save changes</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}