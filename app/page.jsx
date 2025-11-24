import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden pb-16">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* left */}
          <div className="text-center sm:text-left">
            <span className="tracking-tide mb-6 font-light text-gray-500">
              spott<span className="text-purple-400">*</span>
            </span>
            <h1 className="mb-6 text-5xl leading-[0.95] font-bold tracking-tight sm:text-6xl md:text-7xl">
              Discover & <br /> create amazing <br />{" "}
              <span className="bg-linear-to-r from-blue-600 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                event.
              </span>
            </h1>
            <p className="fon-light mb-12 max-w-lg text-lg text-gray-400 sm:text-xl">
              Whether you&apos;re hosting or attending, Spott makes every event
              memorable. Join our community today.
            </p>
            <Link href="/explore">
              <Button size="xl" className="corner-squircle">
                Get Started
              </Button>
            </Link>
          </div>
          {/* right */}
          <div>
            <Image
              src="/hero.png"
              alt="react meetup"
              width={700}
              height={700}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </section>
    </div>
  );
}
