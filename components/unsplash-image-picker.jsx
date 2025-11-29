import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Spinner from "./ui/spinner";
import { Search } from "lucide-react";
import Image from "next/image";

export default function UnsplashImagePicker({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("event");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchImages = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=12&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
      );
      const data = await response.json();
      setImages(data.results || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchImages(query);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Choose Cover Image</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for images..."
            className="flex-1"
          />
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? <Spinner /> : <Search className="size-4" />}
          </Button>
        </form>

        <div className="-mx-6 flex-1 overflow-y-auto px-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 py-4">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image.urls.regular)}
                  className="relative aspect-video overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-purple-500"
                >
                  <Image
                    src={image.urls.small}
                    alt={image.description || "Unsplash image"}
                    className="h-full w-full object-cover"
                    width={400}
                    height={300}
                  />
                </button>
              ))}
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="text-muted-foreground py-12 text-center">
              Search for images to get started
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          Photos from{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Unsplash
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
