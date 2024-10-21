import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Shadcn Label component
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider"; // Shadcn Slider
import { ChromePicker, ColorResult } from "react-color"; // Import the ChromePicker
import { Switch } from "@/components/ui/switch";

type RegionSettings = {
  visible: boolean;
  blx: number;
  bly: number;
  sizew: number;
  sizeh: number;
  domain: string;
  radius: number;
  count: number;
  posFn: string;
  dirx: number;
  diry: number;
  color: string;
};

const initialControls: RegionSettings[] = Array(16).fill({
  visible: false,
  blx: 0,
  bly: 1080,
  sizew: 270,
  sizeh: 270,
  domain: "constrained",
  radius: 1,
  count: 1000,
  posFn: "simple",
  dirx: 1,
  diry: 0,
  color: "rgba(255, 255, 255, 0.5)",
});

export default function App() {
  const [controls, setControls] = useState<RegionSettings[]>(initialControls);
  const [colorPickerVisible, setColorPickerVisible] = useState<boolean[]>(
    Array(16).fill(false)
  );

  const handleControlChange = (
    index: number,
    key: keyof RegionSettings,
    value: number | string | boolean
  ) => {
    const updatedControls = [...controls];
    updatedControls[index] = {
      ...updatedControls[index],
      [key]: value,
    };
    setControls(updatedControls);
  };
  const handleColorChange = (index: number, color: ColorResult) => {
    const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    handleControlChange(index, "color", rgbaColor);
  };

  const toggleColorPicker = (index: number) => {
    const updatedVisibility = [...colorPickerVisible];
    updatedVisibility[index] = !updatedVisibility[index]; // Toggle visibility
    setColorPickerVisible(updatedVisibility);
  };

  return (
    <div className="h-screen bg-background text-foreground p-8 overflow-auto">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(4, minmax(300px, 1fr))" }}
      >
        {controls.map((control, index) => (
          <div
            key={index}
            className="border-solid border-slate-600 border-2 rounded-none p-2 bg-background rounded-lg shadow-md dark:bg-background dark:text-card-foreground"
          >
            <p className="flex flex-row justify-center font-bold mb-2 text-orange-500">
              Zone {index + 1}
            </p>

            {/* Visibility Control using Shadcn Switch */}
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor={`visible-switch-${index}`}>Visible</Label>
              <Switch
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-amber-800"
                id={`visible-switch-${index}`}
                checked={control.visible}
                onCheckedChange={(checked) =>
                  handleControlChange(index, "visible", checked)
                }
              />
            </div>

            {/* Color Picker Toggle */}
            <div className="m2-4">
              {/* <Label className="block mb-2 text-sm">Color</Label> */}
              <Button
                className="w-full  bg-slate-600 text-white hover:bg-slate-500"
                onClick={() => toggleColorPicker(index)}
              >
                {colorPickerVisible[index]
                  ? "Close Color Picker"
                  : "Color Picker"}
              </Button>
              {colorPickerVisible[index] && (
                <ChromePicker
                  color={control.color} // Current RGBA color from the state
                  onChange={(color) => handleColorChange(index, color)}
                />
              )}
            </div>

            {/* Domain Select */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-32">Domain</Label>{" "}
              {/* Adjusted label width */}
              <Select
                value={control.domain}
                onValueChange={(value) =>
                  handleControlChange(index, "domain", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="constrained">Constrained</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Position Function Select */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-32">Movement</Label>{" "}
              {/* Adjusted label width */}
              <Select
                value={control.posFn}
                onValueChange={(value) =>
                  handleControlChange(index, "posFn", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="cosY">Cos Y</SelectItem>
                    <SelectItem value="studentt">Student T</SelectItem>
                    <SelectItem value="cosX">Cos X</SelectItem>
                    <SelectItem value="cosXY">Cos XY</SelectItem>
                    <SelectItem value="direction">Direction</SelectItem>
                    <SelectItem value="simplex">Simplex</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* BLX and BLY Sliders */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">x</Label>{" "}
              {/* Added w-20 to control width */}
              <Slider
                className="w-full"
                value={[control.blx]}
                min={0}
                max={1200}
                step={10}
                onValueChange={(value) =>
                  handleControlChange(index, "blx", value[0])
                }
              />
              <span className="ml-4">{control.blx}px</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">y</Label>{" "}
              {/* Added w-20 to control width */}
              <Slider
                className="w-full"
                value={[control.bly]}
                min={0}
                max={1200}
                step={10}
                onValueChange={(value) =>
                  handleControlChange(index, "bly", value[0])
                }
              />
              <span className="ml-4">{control.bly}px</span>
            </div>

            {/* Size Width and Height Sliders */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">Width</Label>{" "}
              {/* Added w-20 to control width */}
              <Slider
                className="w-full"
                value={[control.sizew]}
                min={100}
                max={1200}
                step={10}
                onValueChange={(value) =>
                  handleControlChange(index, "sizew", value[0])
                }
              />
              <span className="ml-4">{control.sizew}px</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">Height</Label>{" "}
              {/* Added w-20 to control width */}
              <Slider
                className="w-full"
                value={[control.sizeh]}
                min={100}
                max={1200}
                step={10}
                onValueChange={(value) =>
                  handleControlChange(index, "sizeh", value[0])
                }
              />
              <span className="ml-4">{control.sizeh}px</span>
            </div>

            {/* Radius Slider */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">Radius</Label>{" "}
              {/* Added w-20 to control width */}
              <Slider
                className="w-full"
                value={[control.radius]}
                min={0.5}
                max={10}
                step={0.1}
                onValueChange={(value) =>
                  handleControlChange(index, "radius", value[0])
                }
              />
              <span className="ml-4">{control.radius}</span>
            </div>

            {/* Count Slider */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">Count</Label>{" "}
              {/* Added w-20 to control width */}
              <Slider
                className="w-full"
                value={[control.count]}
                min={0}
                max={10000}
                step={100}
                onValueChange={(value) =>
                  handleControlChange(index, "count", value[0])
                }
              />
              <span className="ml-4">{control.count}</span>
            </div>

            {/* Direction X and Y Sliders */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-32">x-direction</Label>{" "}
              {/* Added w-20 to control width */}
              <Slider
                className="w-full"
                value={[control.dirx]}
                min={-5}
                max={5}
                step={0.1}
                onValueChange={(value) =>
                  handleControlChange(index, "dirx", value[0])
                }
              />
              <span className="ml-4">{control.dirx}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Label className="w-32">y-direction</Label>{" "}
              {/* Added w-20 to control width */}
              <Slider
                className="w-full"
                value={[control.diry]}
                min={-5}
                max={5}
                step={0.1}
                onValueChange={(value) =>
                  handleControlChange(index, "diry", value[0])
                }
              />
              <span className="ml-4">{control.diry}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
