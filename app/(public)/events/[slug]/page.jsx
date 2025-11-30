/* eslint-disable react-hooks/purity */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  Share2,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { darkenColor } from "@/lib/darken-color";
import RegisterModal from "./_components/register-modal";
import { format } from "date-fns";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Fetch event details
  const { data: event, isLoading } = useConvexQuery(api.events.getEventBySlug, {
    slug: params.slug,
  });

  // Check if user is already registered
  const { data: registration } = useConvexQuery(
    api.registrations.checkRegistration,
    event?._id ? { eventId: event._id } : "skip",
  );

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description.slice(0, 100) + "...",
          url: url,
        });
      } catch (error) {
        // User cancelled or error occured
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRegister = () => {
    if (!user) {
      toast.error("Please sign in to register");
      return;
    }

    setShowRegisterModal(true);
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner />
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const isEventFull = event.registrationCount >= event.capacity;
  const isEventPast = event.endDate < Date.now();
  const isOrganizer = user?.id === event.organizerId;

  return (
    <div
      style={{
        backgroundColor: event.themeColor || "#1e3a8a",
      }}
      className="-mt-6 min-h-screen py-8 md:-mt-16 lg:-mx-5"
    >
      <div className="mx-auto max-w-7xl px-8">
        {/* Event Title & Info */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">
            {getCategoryIcon(event.category)} {getCategoryLabel(event.category)}
          </Badge>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">{event.title}</h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-5" />
              <span>{format(event.startDate, "EEEE, MMMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-5" />
              <span>
                {format(event.startDate, "h:mm a")} -{" "}
                {format(event.endDate, "h:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Image*/}
        {event.coverImage && (
          <div className="relative mb-6 h-[400px] overflow-hidden rounded-2xl">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main Content*/}
          <div className="space-y-8">
            {/* Description*/}
            <Card
              className={"pt-0"}
              style={{
                backgroundColor: event.themeColor
                  ? darkenColor(event.themeColor, 0.04)
                  : "#1e3a8a",
              }}
            >
              <CardContent className="pt-6">
                <h2 className="mb-4 text-2xl font-bold">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Location Details*/}
            <Card
              className={"pt-0"}
              style={{
                backgroundColor: event.themeColor
                  ? darkenColor(event.themeColor, 0.04)
                  : "#1e3a8a",
              }}
            >
              <CardContent className="pt-6">
                <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                  <MapPin className="size-6 text-purple-500" />
                  Location
                </h2>

                <div className="space-y-3">
                  <p className="font-medium">
                    {event.city}, {event.state || event.country}
                  </p>
                  {event.address && (
                    <p className="text-muted-foreground text-sm">
                      {event.address}
                    </p>
                  )}
                  {event.venue && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="gap-2"
                    >
                      <a
                        href={event.venue}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Map
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info*/}
            <Card
              className={"pt-0"}
              style={{
                backgroundColor: event.themeColor
                  ? darkenColor(event.themeColor, 0.04)
                  : "#1e3a8a",
              }}
            >
              <CardContent className="pt-6">
                <h2 className="mb-4 text-2xl font-bold">Organizer</h2>
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {event.organizerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{event.organizerName}</p>
                    <p className="text-muted-foreground text-sm">
                      Event Organizer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Registration Card*/}
          <div className="h-fit lg:sticky lg:top-24">
            <Card
              className={`overflow-hidden py-0`}
              style={{
                backgroundColor: event.themeColor
                  ? darkenColor(event.themeColor, 0.04)
                  : "#1e3a8a",
              }}
            >
              <CardContent className="space-y-4 p-6">
                {/* Price */}
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Price</p>
                  <p className="text-3xl font-bold">
                    {event.ticketType === "free"
                      ? "Free"
                      : `Rs.${event.ticketPrice}`}
                  </p>
                  {event.ticketType === "paid" && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Pay at event offline
                    </p>
                  )}
                </div>

                <Separator />

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Users className="size-4" />
                      <span className="text-sm">Attendees</span>
                    </div>
                    <p className="font-semibold">
                      {event.registrationCount} / {event.capacity}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span className="text-sm">Date</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {format(event.startDate, "MMM dd")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Clock className="size-4" />
                      <span className="text-sm">Time</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {format(event.startDate, "h:mm a")}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Registration Button */}
                {registration ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-600">
                      <CheckCircle className="size-5" />
                      <span className="font-medium">
                        You&apos;re registered!
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => router.push("/my-tickets")}
                    >
                      <Ticket className="size-4" />
                      View Ticket
                    </Button>
                  </div>
                ) : isEventPast ? (
                  <Button size="sm" className="w-full" disabled>
                    Event Ended
                  </Button>
                ) : isEventFull ? (
                  <Button size="sm" className="w-full" disabled>
                    Event Full
                  </Button>
                ) : isOrganizer ? (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/events/${event.slug}/manage`)}
                  >
                    Manage Event
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={handleRegister}
                  >
                    <Ticket className="h-4 w-4" />
                    Register for Event
                  </Button>
                )}

                {/* Share Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="size-4" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          event={event}
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
}
