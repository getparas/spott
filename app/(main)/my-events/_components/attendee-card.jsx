import { CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { useConvexMutation } from "@/hooks/useConvexQuery";
import { api } from "@/convex/_generated/api";

export function AttendeeCard({ registration }) {
  const { mutate: checkInAttendee, isLoading } = useConvexMutation(
    api.registrations.checkInAttendee,
  );

  const handleManualCheckIn = async () => {
    try {
      const result = await checkInAttendee({ qrCode: registration.qrCode });
      if (result.success) {
        toast.success("Attendee checked in successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to check in attendee");
    }
  };

  return (
    <Card className="py-0">
      <CardContent className="flex items-start gap-4 p-4">
        <div
          className={`mt-1 rounded-full p-2 ${
            registration.checkedIn ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          {registration.checkedIn ? (
            <CheckCircle className="size-5 text-green-600" />
          ) : (
            <Circle className="size-5 text-gray-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-1 font-semibold">{registration.attendeeName}</h3>
          <p className="text-muted-foreground mb-2 text-sm">
            {registration.attendeeEmail}
          </p>
          <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            <span>
              {registration.checkedIn ? "⏰ Checked in" : "📅 Registered"}{" "}
              {registration.checkedIn && registration.checkedInAt
                ? format(registration.checkedInAt, "PPp")
                : format(registration.registeredAt, "PPp")}
            </span>
            <span className="font-mono">QR: {registration.qrCode}</span>
          </div>
        </div>

        {!registration.checkedIn && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualCheckIn}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <CheckCircle className="size-4" />
                Check In
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
