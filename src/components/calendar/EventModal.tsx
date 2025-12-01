import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CalendarEvent } from "../types/calendar";
import { SLOT_DURATION } from "@/lib/constants";

interface EventModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    defaultDate: Date;
    eventToEdit?: CalendarEvent;
    onCreate: (event: CalendarEvent) => void;
    onUpdate?: (event: CalendarEvent) => void;
    onDelete?: (eventId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ 
    isOpen, 
    onOpenChange, 
    defaultDate, 
    eventToEdit,
    onCreate, 
    onUpdate,
    onDelete 
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("blue");
    const [startTime, setStartTime] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (eventToEdit) {
                setTitle(eventToEdit.title);
                setDescription(eventToEdit.description || "");
                setColor(eventToEdit.color || "blue");
                setStartTime(eventToEdit.startTime);
            } else {
                setTitle("");
                setDescription("");
                setColor("blue");
                // Default to current time rounded to nearest slot or defaultDate time if provided
                setStartTime(format(defaultDate, "HH:mm"));
            }
        }
    }, [isOpen, defaultDate, eventToEdit]);

    const handleSave = () => {
        if (!title || !startTime) return;

        // Ensure time is in 30 min increments (simple validation or snapping)
        // For now, we trust the input or user selection
        
        if (eventToEdit && onUpdate) {
            onUpdate({
                ...eventToEdit,
                title,
                description,
                color,
                startTime,
                date: eventToEdit.date, // Date shouldn't change in this modal as per requirements
            });
        } else {
            const newEvent: CalendarEvent = {
                id: String(Date.now()),
                title,
                description,
                color,
                date: defaultDate,
                startTime,
            };
            onCreate(newEvent);
        }

        onOpenChange(false);
    };

    const handleDelete = () => {
        if (eventToEdit && onDelete) {
            onDelete(eventToEdit.id);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{eventToEdit ? "Edit Event" : "Create Event"}</DialogTitle>
                    <DialogDescription>
                        {eventToEdit ? "Update event details." : "Enter details for your new event."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Date</Label>
                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-500">
                            {format(eventToEdit ? eventToEdit.date : defaultDate, "PPP")}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Start Time</Label>
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            step={SLOT_DURATION * 60} // Attempt to step by slot duration in seconds
                        />
                        <p className="text-xs text-gray-500">Duration is fixed to {SLOT_DURATION} minutes.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Color</Label>
                        <select
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="border rounded px-2 py-1"
                        >
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="red">Red</option>
                            <option value="indigo">Indigo</option>
                            <option value="orange">Orange</option>
                            <option value="purple">Purple</option>
                        </select>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {eventToEdit && onDelete && (
                        <Button variant="destructive" onClick={handleDelete} type="button">
                            Delete
                        </Button>
                    )}
                    <Button onClick={handleSave}>
                        {eventToEdit ? "Save Changes" : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
