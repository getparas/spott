/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery";
import { createLocationSlug } from "@/lib/location-utils";
import { City, State } from "country-state-city";
import { Calendar, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "./ui/input";
import Spinner from "./ui/spinner";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { api } from "@/convex/_generated/api";
import { getCategoryIcon } from "@/lib/data";
import { format } from "date-fns";

export default function SearchLocationBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const { data: currentUser, isLoading } = useConvexQuery(
    api.users.getCurrentUser,
  );

  const { mutation: updateLocation } = useConvexMutation(
    api.users.completeOnboarding,
  );

  const { data: searchResults, isLoading: searchLoading } = useConvexQuery(
    api.search.searchEvents,
    searchQuery.trim().length >= 2 ? { query: searchQuery, limit: 5 } : "skip",
  );

  const nepalStates = useMemo(() => State.getStatesOfCountry("NP"), []);

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (currentUser?.location) {
      setSelectedState(currentUser.location.state || "");
      setSelectedCity(currentUser.location.city || "");
    }
  }, [currentUser, isLoading]);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const state = nepalStates.find((s) => s.name === selectedState);
    if (!state) return [];
    return City.getCitiesOfState("NP", state.isoCode);
  }, [selectedState, nepalStates]);

  const debouncedSetQuery = useRef(
    debounce((value) => setSearchQuery(value), 300),
  ).current;

  const handleSearchInput = (e) => {
    const value = e.target.value;
    debouncedSetQuery(value);
    setShowSearchResults(value.length >= 2);
  };

  const handleEventClick = (slug) => {
    setShowSearchResults(false);
    setSearchQuery("");
    router.push(`/events/${slug}`);
  };

  const handleLocationSelect = async (city, state) => {
    try {
      if (currentUser?.interests && currentUser?.location) {
        await updateLocation({
          location: { city, state, country: "Nepal" },
          interests: currentUser.interests,
        });
      }
      const slug = createLocationSlug(city, state);
      router.push(`/explore/${slug}`);
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center">
      {/* Search Bar*/}
      <div className="relative flex w-full" ref={searchRef}>
        <div className="flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search events..."
            onChange={handleSearchInput}
            onFocus={() => {
              if (searchQuery.length >= 2) setShowSearchResults(true);
            }}
            className="h-9 w-full rounded-none rounded-l-md pl-10"
          />
        </div>

        {/* Search Results*/}
        {showSearchResults && (
          <div className="bg-background absolute top-full z-50 mt-2 max-h-[400px] w-96 overflow-y-auto rounded-lg border shadow-lg">
            {searchLoading ? (
              <div className="flex items-center justify-center p-4">
                <Spinner />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="py-2">
                <p className="text-muted-foreground px-4 py-2 text-xs font-semibold">
                  SEARCH RESULTS
                </p>
                {searchResults.map((event) => (
                  <button
                    key={event._id}
                    onClick={() => handleEventClick(event.slug)}
                    className="hover:bg-muted/50 w-full px-4 py-3 text-left transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-2xl">
                        {getCategoryIcon(event.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 line-clamp-1 font-medium">
                          {event.title}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(event.startDate, "MMM dd")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.city}
                          </span>
                        </div>
                      </div>
                      {event.ticketType === "free" && (
                        <Badge variant="secondary" className="text-xs">
                          Free
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* State Select*/}
      <Select
        value={selectedState}
        onValueChange={(value) => {
          setSelectedState(value);
          setSelectedCity("");
        }}
      >
        <SelectTrigger className="h-9 w-32 rounded-none border-l-0">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          {nepalStates.map((state) => (
            <SelectItem key={state.isoCode} value={state.name}>
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City Select*/}
      <Select
        value={selectedCity}
        onValueChange={(value) => {
          setSelectedCity(value);
          if (value && selectedState) {
            handleLocationSelect(value, selectedState);
          }
        }}
        disabled={!selectedState}
      >
        <SelectTrigger className="h-9 w-32 rounded-none rounded-r-md">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.name} value={city.name}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
