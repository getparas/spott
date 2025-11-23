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

const Header = () => {
  const [isSpinner, setIsSpinner] = useState(false);

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
          <div className="flex items-center">
            <Authenticated>
              <UserButton />
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
