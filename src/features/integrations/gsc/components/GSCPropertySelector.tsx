'use client';

/**
 * GSC Property Selector Component
 * @description Dropdown to select which GSC property to use
 */

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe, ExternalLink } from 'lucide-react';

interface GSCProperty {
  siteUrl: string;
  permissionLevel: 'siteOwner' | 'siteFullUser' | 'siteRestrictedUser';
}

interface GSCPropertySelectorProps {
  properties: GSCProperty[];
  selectedProperty?: string;
  onSelect: (property: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function GSCPropertySelector({
  properties,
  selectedProperty,
  onSelect,
  isLoading = false,
  disabled = false,
}: GSCPropertySelectorProps) {
  const getPermissionBadge = (level: GSCProperty['permissionLevel']) => {
    switch (level) {
      case 'siteOwner':
        return 'Owner';
      case 'siteFullUser':
        return 'Full';
      case 'siteRestrictedUser':
        return 'Limited';
      default:
        return '';
    }
  };

  const formatSiteUrl = (url: string) => {
    return url
      .replace('sc-domain:', '')
      .replace('https://', '')
      .replace('http://', '')
      .replace(/\/$/, '');
  };

  if (properties.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No properties found. Make sure you have access to at least one property in Google Search Console.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="gsc-property">Select Property</Label>
      <Select
        value={selectedProperty}
        onValueChange={onSelect}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="gsc-property" className="w-full">
          <SelectValue placeholder="Choose a website property..." />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.siteUrl} value={property.siteUrl}>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{formatSiteUrl(property.siteUrl)}</span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {getPermissionBadge(property.permissionLevel)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedProperty && (
        <a
          href={`https://search.google.com/search-console?resource_id=${encodeURIComponent(selectedProperty)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          Open in Search Console <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
