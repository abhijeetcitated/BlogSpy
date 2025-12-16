'use client';

/**
 * GA4 Property Selector Component
 * @description Dropdown to select which GA4 property to use
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart3, ExternalLink } from 'lucide-react';

interface GA4Property {
  propertyId: string;
  displayName: string;
  websiteUrl?: string;
}

interface GA4PropertySelectorProps {
  properties: GA4Property[];
  selectedProperty?: string;
  onSelect: (property: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GA4PropertySelector({
  properties,
  selectedProperty,
  onSelect,
  isLoading = false,
  disabled = false,
}: GA4PropertySelectorProps) {
  if (properties.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No GA4 properties found. Make sure you have access to at least one property.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="ga4-property">Select Property</Label>
      <Select
        value={selectedProperty}
        onValueChange={onSelect}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="ga4-property" className="w-full">
          <SelectValue placeholder="Choose a GA4 property..." />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.propertyId} value={property.propertyId}>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span>{property.displayName}</span>
                {property.websiteUrl && (
                  <span className="text-xs text-muted-foreground">
                    ({property.websiteUrl})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedProperty && (
        <a
          href={`https://analytics.google.com/analytics/web/#/p${selectedProperty}/reports/reportinghub`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          Open in Analytics <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
