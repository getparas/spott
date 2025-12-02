"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EventCard from "@/components/event-card";
import Spinner from "@/components/ui/spinner";
import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery";

export default function MyEventsPage() {
  const router = useRouter();

  const { data: events, isLoading } = useConvexQuery(api.events.getMyEvents);
  const { mutate: deleteEvent } = useConvexMutation(api.events.deleteEvent);

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations.",
    );

    if (!confirmed) return;

    try {
      await deleteEvent({ eventId });
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  // Navigate to event dashboard instead of event detail
  const handleEventClick = (eventId) => {
    router.push(`/my-events/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">My Events</h1>
            <p className="text-muted-foreground">Manage your created events</p>
          </div>
        </div>

        {events?.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mb-4 text-6xl">📅</div>
              <h2 className="text-2xl font-bold">No events yet</h2>
              <p className="text-muted-foreground">
                Create your first event and start managing attendees
              </p>
              <Button asChild className="gap-2">
                <Link href="/create-event">
                  <Plus className="h-4 w-4" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events?.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                action="event"
                onClick={() => handleEventClick(event._id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
