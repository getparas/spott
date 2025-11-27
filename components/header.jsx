"use client";

import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";
import Spinner from "./ui/spinner";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/useStoreUser";
import { Building, Crown, Plus, Ticket } from "lucide-react";
import OnboardingModal from "./onboarding-modal";
import { useOnboarding } from "@/hooks/useOnboarding";
import SearchLocationBar from "./search-location-bar";
import { Badge } from "./ui/badge";
import UpgradeModal from "./upgrade-modal";

const Header = () => {
  const [isSpinner, setIsSpinner] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();

  const { isLoading } = useStoreUser();

  const { has } = useAuth();
  const hasPro = has?.({ plan: "pro" });

  return (
    <header>
      <nav className="dark:bg-background/80 fixed top-0 right-0 left-0 z-20 border-b bg-slate-900 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo*/}
          <Link href={"/"} className="flex items-center">
            <Image
              src="/spott.png"
              alt="Spott Logo"
              width={500}
              height={500}
              className="h-11 w-full"
              priority
            />

            {/* Pro badge*/}
            {hasPro && (
              <Badge className="ml-3 gap-1 bg-linear-to-r from-pink-500 to-orange-500 text-white">
                <Crown className="size-3" />
                Pro
              </Badge>
            )}
          </Link>

          {/* Search & Location - Desktop Only*/}
          <div className="hidden flex-1 justify-center md:flex">
            <SearchLocationBar />
          </div>

          {/* Loader*/}
          {isLoading && (
            <div className="absolute bottom-0 left-0 w-full">
              <BarLoader color="#fff" width={"100%"} />
            </div>
          )}

          {/* Right Side Action*/}
          <div className="flex items-center gap-4">
            {/* Show Pro badge or Upgrade button*/}

            {!hasPro && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
              >
                Pricing
              </Button>
            )}

            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link href="explore">Explore</Link>
            </Button>
            <Authenticated>
              <Button size="sm" asChild className="mr-4 flex gap-2">
                <Link href="/create-event">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Create Event</span>
                </Link>
              </Button>

              {/* User Button*/}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "size-9",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Tickets"
                    labelIcon={<Ticket size={16} />}
                    href="/my-tickets"
                  />
                  <UserButton.Link
                    label="My Events"
                    labelIcon={<Building size={16} />}
                    href="/my-events"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  disabled={isLoading}
                  onClick={() => {
                    setIsSpinner(true);
                    setTimeout(() => setIsSpinner(false), 500);
                  }}
                >
                  {isSpinner ? <Spinner /> : "Sign In"}
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>

        {/* Mobile Search and Location - Below Header*/}
        <div className="border-t px-3 py-3 md:hidden">
          <SearchLocationBar />
        </div>
      </nav>
      {/* Modals*/}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="header"
      />
    </header>
  );
};

export default Header;
