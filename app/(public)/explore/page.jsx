"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { CATEGORIES } from "@/lib/data";
import Spinner from "@/components/ui/spinner";
import { ArrowRight, Badge, Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/event-card";
import { Card, CardContent } from "@/components/ui/card";

const ExplorePage = () => {
  const router = useRouter();
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  // Fetch current user for location
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  // Fetch events
  const { data: featuredEvents, isLoading: loadingFeatured } = useConvexQuery(
    api.explore.getFeaturedEvents,
    { limit: 3 },
  );

  const { data: localEvents, isLoading: loadingLocal } = useConvexQuery(
    api.explore.getEventsByLocation,
    {
      city: currentUser?.location?.city || "Kathmandu",
      state: currentUser?.location?.state || "Bagmati",
      limit: 4,
    },
  );

  const { data: popularEvents, isLoading: loadingPopular } = useConvexQuery(
    api.explore.getPopularEvents,
    { limit: 6 },
  );

  const { data: categoryCounts } = useConvexQuery(
    api.explore.getCategoryCounts,
  );

  const handleEventClick = (slug) => {
    router.push(`/events/${slug}`);
  };

  const handleCategoryClick = (categoryId) => {
    router.push(`/explore/${categoryId}`);
  };

  const handleViewLocalEvents = () => {
    const city = currentUser?.location?.city || "Kathmandu";
    const state = currentUser?.location?.state || "Bagmati";
    const slug = createLocationSlug(city, state);
    router.push(`/explore/${slug}`);
  };

  // Format categories with counts
  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: categoryCounts?.[cat.id] || 0,
  }));

  // Loading state
  const isLoading = loadingFeatured || loadingLocal || loadingPopular;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <>
      <div className="pb-12 text-center">
        <h1 className="mb-4 text-5xl font-bold md:text-6xl">Discover Events</h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
          Explore featured events, find what&apos;s happening locally, or browse
          events across Nepal
        </p>
      </div>
      {/* Featured Carousal */}
      {featuredEvents && featuredEvents.length > 0 && (
        <div className="mb-16">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {featuredEvents.map((event) => (
                <CarouselItem key={event._id}>
                  <div
                    className="relative h-[400px] cursor-pointer overflow-hidden rounded-xl"
                    onClick={() => handleEventClick(event.slug)}
                  >
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: event.themeColor }}
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/30" />
                    <div className="relative flex h-full flex-col justify-end p-8 md:p-12">
                      <Badge className="mb-4 w-fit" variant="secondary">
                        {event.city}, {event.state || event.country}
                      </Badge>
                      <h2 className="mb-3 text-3xl font-bold text-white md:text-5xl">
                        {event.title}
                      </h2>
                      <p className="mb-4 line-clamp-2 max-w-2xl text-lg text-white/90">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {format(event.startDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{event.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">
                            {event.registrationCount} registered
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      )}
      {/* Local Events */}
      {localEvents && localEvents.length > 0 && (
        <div className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-3xl font-bold">Events Near You</h2>
              <p className="text-muted-foreground">
                Happening in {currentUser?.location?.city || "your area"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleViewLocalEvents}
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {localEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="compact"
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Browse by Category */}
      <div className="mb-16">
        <h2 className="mb-6 text-3xl font-bold">Browse by Category</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
          {categoriesWithCounts.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer py-2 transition-all hover:border-purple-500/50 hover:shadow-lg"
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="flex items-center gap-3 px-3 sm:p-6">
                <div className="text-3xl sm:text-4xl">{category.icon}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 font-semibold transition-colors group-hover:text-purple-400">
                    {category.label}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {category.count} Event{category.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Popular Events Across Country */}
      {popularEvents && popularEvents.length > 0 && (
        <div className="mb-16">
          <div className="mb-6">
            <h2 className="mb-1 text-3xl font-bold">Popular Across Nepal</h2>
            <p className="text-muted-foreground">Trending events nationwide</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="list"
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        </div>
      )}
      {/* Empty State */}
      {!loadingFeatured &&
        !loadingLocal &&
        !loadingPopular &&
        (!featuredEvents || featuredEvents.length === 0) &&
        (!localEvents || localEvents.length === 0) &&
        (!popularEvents || popularEvents.length === 0) && (
          <Card className="p-12 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mb-4 text-6xl">🎉</div>
              <h2 className="text-2xl font-bold">No events yet</h2>
              <p className="text-muted-foreground">
                Be the first to create an event in your area!
              </p>
              <Button asChild className="gap-2" size="sm">
                <a href="/create-event">Create Event</a>
              </Button>
            </div>
          </Card>
        )}
    </>
  );
};

export default ExplorePage;
