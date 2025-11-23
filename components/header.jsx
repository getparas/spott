import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

const Header = () => {
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

          {/* Right Side Action*/}
          <div className="flex items-center">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        {/* Mobile Search and Location - Below Header*/}
      </nav>
      {/* Modals*/}
    </header>
  );
};

export default Header;
