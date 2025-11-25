import { useConvexMutation } from "@/hooks/useConvexQuery";
import { api } from "@/convex/_generated/api";
import { City, State } from "country-state-city";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { ArrowLeft, ArrowRight, Heart, MapPin } from "lucide-react";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { CATEGORIES } from "@/lib/data";

// Fallback cities for Nepal states (in case library doesn't have data)
const NEPAL_CITIES = {
  "Central Region": ["Kathmandu", "Lalitpur", "Bhaktapur", "Kirtipur"],
  "Eastern Region": ["Biratnagar", "Dharan", "Itahari", "Damak"],
  "Western Region": ["Pokhara", "Butwal", "Bharatpur", "Dhangadhi"],
  "Mid-Western Region": ["Nepalgunj", "Tulsipur", "Gulariya"],
  "Far-Western Region": ["Mahendranagar", "Dhangadhi", "Tikapur"],
  "Province No. 1": ["Biratnagar", "Dharan", "Itahari", "Damak"],
  "Madhesh Province": ["Janakpur", "Birgunj", "Kalaiya"],
  "Bagmati Province": ["Kathmandu", "Lalitpur", "Bhaktapur", "Hetauda"],
  "Gandaki Province": ["Pokhara", "Gorkha", "Lamjung"],
  "Lumbini Province": ["Butwal", "Bhairahawa", "Tansen"],
  "Karnali Province": ["Birendranagar", "Jumla", "Dailekh"],
  "Sudurpashchim Province": ["Dhangadhi", "Mahendranagar", "Tikapur"],
};

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [location, setLocation] = useState({
    state: "",
    city: "",
    country: "Nepal",
  });

  const { mutate: completeOnboarding, isLoading } = useConvexMutation(
    api.users.completeOnboarding,
  );

  // Get Nepal states
  const nepalStates = State.getStatesOfCountry("NP");

  // Get cities based on selected state
  let cities = [];
  if (location.state) {
    const selectedState = nepalStates.find((s) => s.name === location.state);
    if (selectedState) {
      // Try to get cities from the library
      const libraryCities = City.getCitiesOfState("NP", selectedState.isoCode);

      // If library has cities, use them
      if (libraryCities && libraryCities.length > 0) {
        cities = libraryCities;
      } else {
        // Otherwise, use our fallback data
        const fallbackCities = NEPAL_CITIES[location.state] || [];
        // Return in the same format as the library
        cities = fallbackCities.map((city) => ({ name: city }));
      }
    }
  }

  const toggleInterest = (categoryId) => {
    setSelectedInterests((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id != categoryId)
        : [...prev, categoryId],
    );
  };

  const handleNext = () => {
    if (step === 1 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }
    if (step === 2 && (!location.city || !location.state)) {
      toast.error("Please select both state and city");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding({
        location: {
          city: location.city,
          state: location.state,
          country: location.country,
        },
        interests: selectedInterests,
      });
      toast.success("Welcome to Spott! 🎉");
      onComplete();
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error(error);
    }
  };

  const progress = (step / 2) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-4">
            <Progress value={progress} className="h-1" />
          </div>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {step === 1 ? (
              <>
                <Heart className="size-6 text-purple-500" />
                What interests you?
              </>
            ) : (
              <>
                <MapPin className="size-6 text-purple-500" />
                Where are you located?
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Select at least 3 categories to personalize your experience"
              : "We'll show you events happening near you"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* Step 1: Select Interests*/}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto p-2 sm:grid-cols-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleInterest(category.id)}
                    className={`rounded-lg border-2 p-4 transition-all hover:scale-105 ${
                      selectedInterests.includes(category.id)
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                        : "border-border hover:border-purple-300"
                    }`}
                  >
                    <div className="mb-2 text-2xl">{category.icon}</div>
                    <div className="text-sm font-medium">{category.label}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedInterests.length >= 3 ? "default" : "secondary"
                  }
                >
                  {selectedInterests.length} selected
                </Badge>
                {selectedInterests.length >= 3 && (
                  <span className="text-sm text-green-500">
                    ✓ Ready to continue
                  </span>
                )}
              </div>
            </div>
          )}
          {/* Step 2: Location*/}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={location.state}
                    onValueChange={(value) => {
                      setLocation({ ...location, state: value, city: "" });
                    }}
                  >
                    <SelectTrigger id="state" className="h-11 w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nepalStates.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={location.city}
                    onValueChange={(value) =>
                      setLocation({ ...location, city: value })
                    }
                    disabled={!location.state}
                  >
                    <SelectTrigger id="city" className="h-11 w-full">
                      <SelectValue
                        placeholder={
                          location.state ? "Select city" : "State first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-cities" disabled>
                          No cities available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {location.city && location.state && (
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Your location</p>
                      <p className="text-muted-foreground text-sm">
                        {location.city}, {location.state}, {location.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions*/}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            {isLoading
              ? "Completing..."
              : step === 2
                ? "Complete Setup"
                : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
