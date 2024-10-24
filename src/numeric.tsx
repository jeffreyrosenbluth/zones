import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type NumericProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  labelWidth?: string; // Optional prop for label width
};

export default function Numeric({
  label,
  value,
  min,
  max,
  step,
  onValueChange,
  labelWidth = "w-20", // Default value if no labelWidth is provided
}: NumericProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleSliderChange = (newValue: number[]) => {
    setLocalValue(newValue[0]);
  };

  const handleSliderCommit = (newValue: number[]) => {
    onValueChange(newValue[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      const clampedValue = Math.min(Math.max(newValue, min), max);
      setLocalValue(clampedValue);
      onValueChange(clampedValue);
    }
  };

  return (
    <div className="mt-1 flex items-center justify-stretch gap-2">
      <Label className={labelWidth}>{label}</Label>
      <Slider
        className="w-full"
        value={[localValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
      />
      <Input
        type="number"
        className="w-20 h-7 bg-stone-700 rounded-none"
        value={localValue}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

/// Usage
{
  /* <Numeric
label="x-direction"
labelWidth="w-48"
value={localControls[index]?.dirx ?? control.dirx}
min={-5}
max={5}
step={0.1}
onValueChange={(value) =>
  handleControlChange(index, "dirx", value)
}
/> */
}
