"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { useState } from "react";
import Spinner from "./ui/spinner";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/useStoreUser";
import { Building, Plus, Ticket } from "lucide-react";

const Header = () => {
  const [isSpinner, setIsSpinner] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { isLoading } = useStoreUser();
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
          </Link>

          {/* Search & Location - Desktop Only*/}

          {/* Loader*/}
          {isLoading && (
            <div className="absolute bottom-0 left-0 w-full">
              <BarLoader color="#fff" width={"100%"} />
            </div>
          )}

          {/* Right Side Action*/}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpgradeModal(true)}
            >
              Pricing
            </Button>
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
              <UserButton>
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
      </nav>
      {/* Modals*/}
    </header>
  );
};

export default Header;
