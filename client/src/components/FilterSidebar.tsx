import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const categories = ["Silk Sarees", "Cotton Sarees", "Designer Sarees", "Bridal Sarees"];
const fabrics = ["Silk", "Cotton", "Georgette", "Chiffon", "Net", "Crepe"];
const occasions = ["Wedding", "Party", "Festival", "Casual", "Office"];
const colors = ["Red", "Blue", "Green", "Pink", "Yellow", "Black", "White"];

export default function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [openSections, setOpenSections] = useState<string[]>(["categories", "price", "fabric"]);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-md" data-testid="sidebar-filters">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" data-testid="button-clear-filters">
          Clear All
        </Button>
      </div>

      <Collapsible open={openSections.includes("categories")}>
        <CollapsibleTrigger 
          className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
          onClick={() => toggleSection("categories")}
          data-testid="button-toggle-categories"
        >
          <span className="font-medium">Categories</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("categories") ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={category} data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, '-')}`} />
              <Label htmlFor={category} className="text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("price")}>
        <CollapsibleTrigger 
          className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
          onClick={() => toggleSection("price")}
          data-testid="button-toggle-price"
        >
          <span className="font-medium">Price Range</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("price") ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={10000}
            step={500}
            data-testid="slider-price-range"
          />
          <div className="flex items-center justify-between text-sm">
            <span data-testid="text-price-min">₹{priceRange[0]}</span>
            <span data-testid="text-price-max">₹{priceRange[1]}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("fabric")}>
        <CollapsibleTrigger 
          className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
          onClick={() => toggleSection("fabric")}
          data-testid="button-toggle-fabric"
        >
          <span className="font-medium">Fabric Type</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("fabric") ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {fabrics.map((fabric) => (
            <div key={fabric} className="flex items-center space-x-2">
              <Checkbox id={fabric} data-testid={`checkbox-fabric-${fabric.toLowerCase()}`} />
              <Label htmlFor={fabric} className="text-sm cursor-pointer">
                {fabric}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("occasion")}>
        <CollapsibleTrigger 
          className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
          onClick={() => toggleSection("occasion")}
          data-testid="button-toggle-occasion"
        >
          <span className="font-medium">Occasion</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("occasion") ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {occasions.map((occasion) => (
            <div key={occasion} className="flex items-center space-x-2">
              <Checkbox id={occasion} data-testid={`checkbox-occasion-${occasion.toLowerCase()}`} />
              <Label htmlFor={occasion} className="text-sm cursor-pointer">
                {occasion}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("color")}>
        <CollapsibleTrigger 
          className="flex items-center justify-between w-full py-2 hover-elevate px-2 rounded-md"
          onClick={() => toggleSection("color")}
          data-testid="button-toggle-color"
        >
          <span className="font-medium">Color</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes("color") ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border-2 border-border hover-elevate"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
                data-testid={`button-color-${color.toLowerCase()}`}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
