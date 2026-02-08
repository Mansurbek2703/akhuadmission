"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "UZ", dial: "+998", flag: "\u{1F1FA}\u{1F1FF}", name: "Uzbekistan" },
  { code: "KZ", dial: "+7", flag: "\u{1F1F0}\u{1F1FF}", name: "Kazakhstan" },
  { code: "TJ", dial: "+992", flag: "\u{1F1F9}\u{1F1EF}", name: "Tajikistan" },
  { code: "KG", dial: "+996", flag: "\u{1F1F0}\u{1F1EC}", name: "Kyrgyzstan" },
  { code: "TM", dial: "+993", flag: "\u{1F1F9}\u{1F1F2}", name: "Turkmenistan" },
  { code: "RU", dial: "+7", flag: "\u{1F1F7}\u{1F1FA}", name: "Russia" },
  { code: "US", dial: "+1", flag: "\u{1F1FA}\u{1F1F8}", name: "United States" },
  { code: "GB", dial: "+44", flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom" },
  { code: "DE", dial: "+49", flag: "\u{1F1E9}\u{1F1EA}", name: "Germany" },
  { code: "FR", dial: "+33", flag: "\u{1F1EB}\u{1F1F7}", name: "France" },
  { code: "TR", dial: "+90", flag: "\u{1F1F9}\u{1F1F7}", name: "Turkey" },
  { code: "AE", dial: "+971", flag: "\u{1F1E6}\u{1F1EA}", name: "UAE" },
  { code: "SA", dial: "+966", flag: "\u{1F1F8}\u{1F1E6}", name: "Saudi Arabia" },
  { code: "CN", dial: "+86", flag: "\u{1F1E8}\u{1F1F3}", name: "China" },
  { code: "KR", dial: "+82", flag: "\u{1F1F0}\u{1F1F7}", name: "South Korea" },
  { code: "JP", dial: "+81", flag: "\u{1F1EF}\u{1F1F5}", name: "Japan" },
  { code: "IN", dial: "+91", flag: "\u{1F1EE}\u{1F1F3}", name: "India" },
  { code: "PK", dial: "+92", flag: "\u{1F1F5}\u{1F1F0}", name: "Pakistan" },
  { code: "AF", dial: "+93", flag: "\u{1F1E6}\u{1F1EB}", name: "Afghanistan" },
  { code: "AZ", dial: "+994", flag: "\u{1F1E6}\u{1F1FF}", name: "Azerbaijan" },
  { code: "GE", dial: "+995", flag: "\u{1F1EC}\u{1F1EA}", name: "Georgia" },
  { code: "UA", dial: "+380", flag: "\u{1F1FA}\u{1F1E6}", name: "Ukraine" },
  { code: "BY", dial: "+375", flag: "\u{1F1E7}\u{1F1FE}", name: "Belarus" },
  { code: "IT", dial: "+39", flag: "\u{1F1EE}\u{1F1F9}", name: "Italy" },
  { code: "ES", dial: "+34", flag: "\u{1F1EA}\u{1F1F8}", name: "Spain" },
  { code: "CA", dial: "+1", flag: "\u{1F1E8}\u{1F1E6}", name: "Canada" },
  { code: "AU", dial: "+61", flag: "\u{1F1E6}\u{1F1FA}", name: "Australia" },
  { code: "BR", dial: "+55", flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil" },
  { code: "MY", dial: "+60", flag: "\u{1F1F2}\u{1F1FE}", name: "Malaysia" },
  { code: "ID", dial: "+62", flag: "\u{1F1EE}\u{1F1E9}", name: "Indonesia" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PhoneInput({ value, onChange, className }: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial value to extract country code and number
  useEffect(() => {
    if (value && !localNumber) {
      for (const country of COUNTRIES) {
        if (value.startsWith(country.dial)) {
          setSelectedCountry(country);
          setLocalNumber(value.slice(country.dial.length).trim());
          return;
        }
      }
      setLocalNumber(value);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNumberChange = (num: string) => {
    // Only allow digits and spaces
    const cleaned = num.replace(/[^\d\s]/g, "");
    setLocalNumber(cleaned);
    onChange(`${selectedCountry.dial} ${cleaned}`.trim());
  };

  const handleSelectCountry = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    onChange(`${country.dial} ${localNumber}`.trim());
    setOpen(false);
    setSearch("");
    inputRef.current?.focus();
  };

  const filteredCountries = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search)
      )
    : COUNTRIES;

  return (
    <div className={cn("relative flex", className)} ref={dropdownRef}>
      {/* Country Selector Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-l-md border border-r-0 border-input bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/80 transition-colors shrink-0"
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-medium text-xs text-muted-foreground">{selectedCountry.code}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {/* Dial Code Display + Number Input */}
      <div className="flex flex-1 items-center rounded-r-md border border-input bg-card">
        <span className="pl-3 pr-1 text-sm text-muted-foreground font-medium shrink-0">
          {selectedCountry.dial}
        </span>
        <input
          ref={inputRef}
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="90 123 45 67"
          className="flex-1 bg-transparent py-2 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-popover shadow-lg">
          {/* Search */}
          <div className="border-b border-border p-2">
            <Input
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 bg-card text-foreground text-sm"
              autoFocus
            />
          </div>
          {/* List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredCountries.map((country) => (
              <button
                key={`${country.code}-${country.dial}`}
                type="button"
                onClick={() => handleSelectCountry(country)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors",
                  selectedCountry.code === country.code && selectedCountry.dial === country.dial
                    ? "bg-accent/50 text-foreground"
                    : "text-foreground"
                )}
              >
                <span className="text-base leading-none">{country.flag}</span>
                <span className="flex-1 text-left">{country.name}</span>
                <span className="text-xs text-muted-foreground font-medium">{country.code}</span>
                <span className="text-xs text-muted-foreground">{country.dial}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No countries found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
