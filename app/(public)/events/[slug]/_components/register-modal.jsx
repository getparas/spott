"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, CheckCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useConvexMutation } from "@/hooks/useConvexQuery";
import Spinner from "@/components/ui/spinner";

export default function RegisterModal({ event, isOpen, onClose }) {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || "",
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: registerForEvent, isLoading } = useConvexMutation(
    api.registrations.registerForEvent,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await registerForEvent({
        eventId: event._id,
        attendeeName: name,
        attendeeEmail: email,
      });

      setIsSuccess(true);
      toast.success("Registration successful! 🎉");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  const handleViewTicket = () => {
    router.push("/my-tickets");
    onClose();
  };

  // Success state
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center space-y-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-bold">You&apos;re All Set!</h2>
              <p className="text-muted-foreground">
                Your registration is confirmed. Check your Tickets for event
                details and your QR code ticket.
              </p>
            </div>
            <Separator />
            <div className="w-full space-y-2">
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={handleViewTicket}
              >
                <Ticket className="size-4" />
                View My Ticket
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Registration form
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>
            Fill in your details to register for {event.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Summary */}
          <div className="bg-muted space-y-2 rounded-lg p-4">
            <p className="font-semibold">{event.title}</p>
            <p className="text-muted-foreground text-sm">
              {event.ticketType === "free" ? (
                "Free Event"
              ) : (
                <span>
                  Price: ₹{event.ticketPrice}{" "}
                  <span className="text-xs">(Pay at venue)</span>
                </span>
              )}
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Terms */}
          <p className="text-muted-foreground text-xs">
            By registering, you agree to receive event updates and reminders via
            email.
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              className="flex-1 gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Registering...
                </>
              ) : (
                <>
                  <Ticket className="size-4" />
                  Register
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
