import { useEffect } from "react";
import useCanvasWindow from "@/art";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChromePicker, ColorResult } from "react-color";
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
  const { openCanvasWindow } = useCanvasWindow();

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "c") {
      // Detect if the 'c' key is pressed
      openCanvasWindow();
    }
  };

  useEffect(() => {
    // Attach keypress event listener
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      // Cleanup listener on unmount
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

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
    updatedVisibility[index] = !updatedVisibility[index];
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
            className="border-solid border-slate-600 border-2 rounded-none p-2 bg-background shadow-md dark:bg-background dark:text-card-foreground"
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

            {/* x and y Sliders */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">x</Label>{" "}
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
              <span className="ml-4">{control.blx}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">y</Label>{" "}
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
              <span className="ml-4">{control.bly}</span>
            </div>

            {/* Size Width and Height Sliders */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">Width</Label>{" "}
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
              <span className="ml-4">{control.sizew}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">Height</Label>{" "}
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
              <span className="ml-4">{control.sizeh}</span>
            </div>

            {/* Domain Select */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-32">Domain</Label>{" "}
              <Select
                value={control.domain}
                onValueChange={(value) =>
                  handleControlChange(index, "domain", value)
                }
              >
                <SelectTrigger className="w-full bg-slate-600">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent className="bg-slate-600">
                  <SelectGroup>
                    <SelectItem value="constrained">Constrained</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Radius Slider */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">Radius</Label>{" "}
              <Slider
                className="w-full"
                value={[control.radius]}
                min={0.5}
                max={10}
                step={0.5}
                onValueChange={(value) =>
                  handleControlChange(index, "radius", value[0])
                }
              />
              <span className="ml-4">{control.radius}</span>
            </div>

            {/* Count Slider */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-20">Count</Label>{" "}
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

            {/* Movement Select */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-32">Movement</Label>{" "}
              {/* Adjusted label width */}
              <Select
                value={control.posFn}
                onValueChange={(value) =>
                  handleControlChange(index, "posFn", value)
                }
              >
                <SelectTrigger className="w-full bg-slate-600">
                  <SelectValue placeholder="Select a function" />
                </SelectTrigger>
                <SelectContent className="bg-slate-600">
                  <SelectGroup>
                    <SelectItem value="simple">Random Walk</SelectItem>
                    <SelectItem value="studentt">
                      t-distribution walk
                    </SelectItem>
                    <SelectItem value="simplex">Flow Field</SelectItem>
                    <SelectItem value="cosY">Sinusoid Horizontal</SelectItem>
                    <SelectItem value="cosX">Sinusoid Vertical</SelectItem>
                    <SelectItem value="cosXY">Sinusoid</SelectItem>
                    <SelectItem value="direction">Direction</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Direction X and Y Sliders */}
            <div className="mt-2 flex items-center justify-between">
              <Label className="w-32">x-direction</Label>{" "}
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

            {/* Color Picker Toggle */}
            <div className="mt-2">
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
                  color={control.color}
                  onChange={(color) => handleColorChange(index, color)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
