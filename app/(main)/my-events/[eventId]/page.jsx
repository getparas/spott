"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Trash2,
  QrCode,
  CheckCircle,
  Download,
  Search,
  Eye,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import QRScannerModal from "../_components/qr-scanner-modal";
import { AttendeeCard } from "../_components/attendee-card";
import Spinner from "@/components/ui/spinner";
import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery";

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Fetch event dashboard data
  const { data: dashboardData, isLoading } = useConvexQuery(
    api.dashboard.getEventDashboard,
    { eventId },
  );

  // Fetch registrations
  const { data: registrations, isLoading: loadingRegistrations } =
    useConvexQuery(api.registrations.getEventRegistrations, { eventId });

  // Delete event mutation
  const { mutate: deleteEvent, isLoading: isDeleting } = useConvexMutation(
    api.dashboard.deleteEvent,
  );

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations.",
    );

    if (!confirmed) return;

    try {
      await deleteEvent({ eventId });
      toast.success("Event deleted successfully");
      router.push("/my-events");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    const csvContent = [
      [
        "Name",
        "Email",
        "Registered At",
        "Checked In",
        "Checked In At",
        "QR Code",
      ],
      ...registrations.map((reg) => [
        reg.attendeeName,
        reg.attendeeEmail,
        new Date(reg.registeredAt).toLocaleString(),
        reg.checkedIn ? "Yes" : "No",
        reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : "-",
        reg.qrCode,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dashboardData?.event.title || "event"}_registrations.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  if (isLoading || loadingRegistrations) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!dashboardData) {
    notFound();
  }

  const { event, stats } = dashboardData;

  // Filter registrations based on active tab and search
  const filteredRegistrations = registrations?.filter((reg) => {
    const matchesSearch =
      reg.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.qrCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch && reg.status === "confirmed";
    if (activeTab === "checked-in")
      return matchesSearch && reg.checkedIn && reg.status === "confirmed";
    if (activeTab === "pending")
      return matchesSearch && !reg.checkedIn && reg.status === "confirmed";

    return matchesSearch;
  });

  return (
    <div className="min-h-screen px-4 pb-20">
      <div className="mx-auto max-w-7xl">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push("/my-events")}
            className="-ml-2 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Events
          </Button>
        </div>

        {event.coverImage && (
          <div className="relative mb-6 h-[350px] overflow-hidden rounded-2xl">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Event Header */}
        <div className="mb-4 flex flex-col items-start justify-between gap-5 sm:flex-row">
          <div className="flex-1">
            <h1 className="mb-3 text-3xl font-bold">{event.title}</h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
              <Badge variant="outline">
                {getCategoryIcon(event.category)}{" "}
                {getCategoryLabel(event.category)}
              </Badge>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(event.startDate, "PPP")}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {event.locationType === "online"
                    ? "Online"
                    : `${event.city}, ${event.state || event.country}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/events/${event.slug}`)}
              className="flex-1 gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 gap-2 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        {/* Quick Actions - Show QR Scanner if event is today */}
        {stats.isEventToday && !stats.isEventPast && (
          <Button
            size="sm"
            className="mb-8 h-10 w-full gap-2 bg-linear-to-r from-orange-500 via-pink-500 to-red-500 text-white hover:scale-[1.02]"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode className="h-6 w-6" />
            Scan QR Code to Check-In
          </Button>
        )}

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="py-0">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="rounded-lg bg-purple-100 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalRegistrations}/{stats.capacity}
                </p>
                <p className="text-muted-foreground text-sm">Capacity</p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="rounded-lg bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.checkedInCount}</p>
                <p className="text-muted-foreground text-sm">Checked In</p>
              </div>
            </CardContent>
          </Card>

          {event.ticketType === "paid" ? (
            <Card className="py-0">
              <CardContent className="flex items-center gap-3 p-6">
                <div className="rounded-lg bg-blue-100 p-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue}</p>
                  <p className="text-muted-foreground text-sm">Revenue</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="py-0">
              <CardContent className="flex items-center gap-3 p-6">
                <div className="rounded-lg bg-orange-100 p-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.checkInRate}%</p>
                  <p className="text-muted-foreground text-sm">Check-in Rate</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="py-0">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="rounded-lg bg-amber-100 p-3">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.isEventPast
                    ? "Ended"
                    : stats.hoursUntilEvent > 24
                      ? `${Math.floor(stats.hoursUntilEvent / 24)}d`
                      : `${stats.hoursUntilEvent}h`}
                </p>
                <p className="text-muted-foreground text-sm">
                  {stats.isEventPast ? "Event Over" : "Time Left"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendee Management */}
        <h2 className="mb-4 text-2xl font-bold">Attendee Management</h2>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All ({stats.totalRegistrations})
            </TabsTrigger>
            <TabsTrigger value="checked-in">
              Checked In ({stats.checkedInCount})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({stats.pendingCount})
            </TabsTrigger>
          </TabsList>

          {/* Search and Actions */}
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search by name, email, or QR code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Attendee List */}
          <TabsContent value={activeTab} className="mt-0 space-y-3">
            {filteredRegistrations && filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((registration) => (
                <AttendeeCard
                  key={registration._id}
                  registration={registration}
                />
              ))
            ) : (
              <div className="text-muted-foreground py-12 text-center">
                No attendees found
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
