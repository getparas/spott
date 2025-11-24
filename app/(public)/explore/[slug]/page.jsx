"use client";

import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { CATEGORIES } from "@/lib/data";
import { parseLocationSlug } from "@/lib/location-utils";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/event-card";
import Spinner from "@/components/ui/spinner";
import { useConvexQuery } from "@/hooks/useConvexQuery";

export default function DynamicExplorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  // Check if it's a valid category
  const categoryInfo = CATEGORIES.find((cat) => cat.id === slug);
  const isCategory = !!categoryInfo;

  // If not a category, validate location
  const { city, state, isValid } = !isCategory
    ? parseLocationSlug(slug)
    : { city: null, state: null, isValid: true };

  // If it's not a valid category and not a valid location, show 404
  if (!isCategory && !isValid) {
    notFound();
  }

  // Fetch events based on type
  const { data: events, isLoading } = useConvexQuery(
    isCategory
      ? api.explore.getEventsByCategory
      : api.explore.getEventsByLocation,
    isCategory
      ? { category: slug, limit: 50 }
      : city && state
        ? { city, state, limit: 50 }
        : "skip",
  );

  const handleEventClick = (eventSlug) => {
    router.push(`/events/${eventSlug}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Category View
  if (isCategory) {
    return (
      <>
        <div className="pb-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="text-6xl">{categoryInfo.icon}</div>
            <div>
              <h1 className="text-5xl font-bold md:text-6xl">
                {categoryInfo.label}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {categoryInfo.description}
              </p>
            </div>
          </div>

          {events && events.length > 0 && (
            <p className="text-muted-foreground">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No events found in this category.
          </p>
        )}
      </>
    );
  }

  // Location View
  return (
    <>
      <div className="pb-5">
        <div className="mb-4 flex items-center gap-4">
          <div className="text-6xl">📍</div>
          <div>
            <h1 className="text-5xl font-bold md:text-6xl">Events in {city}</h1>
            <p className="text-muted-foreground mt-2 text-lg">{state}, Nepal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-2">
            <MapPin className="h-3 w-3" />
            {city}, {state}
          </Badge>
          {events && events.length > 0 && (
            <p className="text-muted-foreground">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => handleEventClick(event.slug)}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No events in {city}, {state} yet.
        </p>
      )}
    </>
  );
}
