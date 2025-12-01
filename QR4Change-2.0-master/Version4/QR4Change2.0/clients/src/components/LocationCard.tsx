import { useEffect, useState } from "react";
import { MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LocationCardProps {
  location?: string;
  timestamp?: string;
  className?: string;
  onLocationChange?: (location: string, timestamp?: string) => void;
}

const LocationCard = ({ 
  location,
  timestamp,
  className = "",
  onLocationChange
}: LocationCardProps) => {
  const [autoLocation, setAutoLocation] = useState<string>("Auto-detecting location...");
  const [autoTimestamp, setAutoTimestamp] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (location) return; // Caller provided location, skip auto-detect

    setAutoTimestamp(new Date().toLocaleString());

    const updateLocationFromCoords = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          { headers: { "Accept": "application/json" } }
        );
        if (!response.ok) throw new Error("Reverse geocoding failed");
        const data = await response.json();
        const displayName: string | undefined = data?.display_name;
        const resolved = displayName && displayName.length > 0
          ? displayName
          : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setAutoLocation(resolved);
        if (onLocationChange) onLocationChange(resolved, new Date().toLocaleString());
      } catch (_err) {
        const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setAutoLocation(fallback);
        if (onLocationChange) onLocationChange(fallback, new Date().toLocaleString());
      }
    };

    if (!("geolocation" in navigator)) {
      const msg = "Geolocation not supported by this browser";
      setAutoLocation(msg);
      if (onLocationChange) onLocationChange(msg, new Date().toLocaleString());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocationFromCoords(latitude, longitude);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setAutoLocation("Location permission denied. Please allow access.");
            if (onLocationChange) onLocationChange("Location permission denied. Please allow access.", new Date().toLocaleString());
            break;
          case error.POSITION_UNAVAILABLE:
            setAutoLocation("Location unavailable. Try again.");
            if (onLocationChange) onLocationChange("Location unavailable. Try again.", new Date().toLocaleString());
            break;
          case error.TIMEOUT:
            setAutoLocation("Location request timed out. Try again.");
            if (onLocationChange) onLocationChange("Location request timed out. Try again.", new Date().toLocaleString());
            break;
          default:
            setAutoLocation("Unable to fetch location.");
            if (onLocationChange) onLocationChange("Unable to fetch location.", new Date().toLocaleString());
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [location]);

  const displayLocation = location ?? autoLocation;
  const displayTimestamp = timestamp ?? autoTimestamp;
  return (
    <Card className={`border-accent/20 bg-gradient-to-r from-accent/5 to-secondary/5 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <MapPin className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Current Location</p>
              <p className="text-sm text-muted-foreground">{displayLocation}</p>
              {displayTimestamp && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{displayTimestamp}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-success/10 text-success">
            GPS Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationCard;