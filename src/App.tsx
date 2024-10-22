import { useEffect } from "react";
import useCanvasWindow from "@/art";
import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { RegionSettings } from "./core";

const initialControls: RegionSettings[] = Array(16).fill({
  visible: false,
  tlx: 0,
  tly: 0,
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
  const [colorPickerVisible] = useState<boolean[]>(Array(16).fill(false));
  const { openCanvasWindow, newWindowRef } = useCanvasWindow();

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "c") {
      openCanvasWindow();
    }
  };

  const sendMessageToCanvas = (updatedSettings: RegionSettings[]) => {
    if (newWindowRef.current) {
      // Use postMessage to send region settings to the canvas window
      newWindowRef.current.postMessage(
        { type: "updateSettings", payload: updatedSettings },
        "*"
      );
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

  useEffect(() => {
    sendMessageToCanvas(controls);
  }, [controls]);

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

  return (
    <div className="h-screen bg-background text-foreground p-8 overflow-auto">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(4, minmax(300px, 1fr))" }}
      >
        {controls.map((control, index) => (
          <div
            key={index}
            className="border-solid border-rose-400 border-2 rounded-none p-2 bg-background shadow-md dark:bg-background dark:text-card-foreground"
          >
            {/* Visibility Control using Shadcn Switch */}
            <div className="flex gap-4 items-center justify-center mb-1">
              <Label
                className="font-black text-rose-500"
                htmlFor={`visible-switch-${index}`}
              >
                ZONE {index + 1}
              </Label>
              <Switch
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-stone-500"
                id={`visible-switch-${index}`}
                checked={control.visible}
                onCheckedChange={(checked) =>
                  handleControlChange(index, "visible", checked)
                }
              />
            </div>

            {/* x and y Sliders */}
            <div className="mt-1 flex items-center justify-stretch gap-2">
              <Label className="w-20">x</Label>{" "}
              <Slider
                className="w-full"
                value={[control.tlx]}
                min={0}
                max={newWindowRef.current?.innerWidth || 1080}
                step={10}
                onValueChange={(value) =>
                  handleControlChange(index, "tlx", value[0])
                }
              />
              <Input
                type="number"
                className="w-20 h-7 bg-stone-700 rounded-none"
                value={control.tlx}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    handleControlChange(
                      index,
                      "tlx",
                      Math.min(Math.max(value, 0), 10000)
                    );
                  }
                }}
                min={0}
                max={newWindowRef.current?.innerWidth || 1080}
                step={10}
              />
            </div>

            <div className="mt-1 flex items-center justify-stretch gap-2">
              <Label className="w-20">y</Label>{" "}
              <Slider
                className="w-full"
                value={[control.tly]}
                min={0}
                max={newWindowRef.current?.innerHeight || 1080}
                step={10}
                onValueChange={(value) =>
                  handleControlChange(index, "tly", value[0])
                }
              />
              <Input
                type="number"
                className="w-20 h-7 bg-stone-700 rounded-none"
                value={control.tly}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    handleControlChange(
                      index,
                      "tly",
                      Math.min(
                        Math.max(value, 0),
                        newWindowRef.current?.innerHeight || 1080
                      )
                    );
                  }
                }}
                min={0}
                max={newWindowRef.current?.innerWidth || 1080}
                step={10}
              />
            </div>

            {/* Size Width and Height Sliders */}
            <div className="mt-1 flex items-center justify-stretch gap-2">
              <Label className="w-20">Width</Label>{" "}
              <Slider
                className="w-full"
                value={[control.sizew]}
                min={100}
                max={newWindowRef.current?.innerWidth || 1080}
                step={10}
                onValueChange={(value) =>
                  handleControlChange(index, "sizew", value[0])
                }
              />
              <Input
                type="number"
                className="w-20 h-7 bg-stone-700 rounded-none"
                value={control.sizew}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    handleControlChange(
                      index,
                      "sizew",
                      Math.min(
                        Math.max(value, 0),
                        newWindowRef.current?.innerWidth || 1080
                      )
                    );
                  }
                }}
                min={0}
                max={newWindowRef.current?.innerWidth || 1080}
                step={10}
              />
            </div>

            <div className="mt-1 flex items-center justify-stretch gap-2">
              <Label className="w-20">Height</Label>{" "}
              <Slider
                className="w-full"
                value={[control.sizeh]}
                min={100}
                max={newWindowRef.current?.innerHeight || 1080}
                step={10}
                onValueChange={(value) =>
                  handleControlChange(index, "sizeh", value[0])
                }
              />
              <Input
                type="number"
                className="w-20 h-7 bg-stone-700 rounded-none"
                value={control.sizeh}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    handleControlChange(
                      index,
                      "sizeh",
                      Math.min(
                        Math.max(value, 0),
                        newWindowRef.current?.innerHeight || 1080
                      )
                    );
                  }
                }}
                min={0}
                max={newWindowRef.current?.innerHeight || 1080}
                step={10}
              />
            </div>
            <Separator className="bg-stone-300 my-2" />
            {/* Domain Radio Group */}
            <div className="mt-1 flex items-center justify-center p-1">
              {/* <Label className="w-32">Domain</Label> */}
              <RadioGroup
                value={control.domain}
                onValueChange={(value) =>
                  handleControlChange(index, "domain", value)
                }
                className="flex space-x-4" // This makes the radio buttons appear in one line
              >
                <RadioGroupItem
                  value="constrained"
                  id={`constrained-${index}`}
                  className="bg-stone-700"
                />
                <Label htmlFor={`constrained-${index}`} className="mr-4">
                  Constrained
                </Label>

                <RadioGroupItem
                  value="free"
                  id={`free-${index}`}
                  className="bg-stone-700"
                />
                <Label htmlFor={`free-${index}`}>Free</Label>
              </RadioGroup>
            </div>

            <Separator className="bg-stone-300 my-2" />
            {/* Radius Slider */}
            <div className="mt-1 flex items-center justify-stretch gap-2">
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
              <Input
                type="number"
                className="w-20 h-7 bg-stone-700 rounded-none"
                value={control.radius}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    handleControlChange(
                      index,
                      "radius",
                      Math.min(Math.max(value, 0), 10)
                    );
                  }
                }}
                min={0.5}
                max={10}
                step={0.5}
              />
            </div>

            {/* Count Slider */}
            <div className="mt-1 flex items-center justify-stretch gap-2">
              <Label className="w-20">Count</Label>{" "}
              <Slider
                className="w-full"
                value={[control.count]}
                min={0}
                max={9999}
                step={100}
                onValueChange={(value) =>
                  handleControlChange(index, "count", value[0])
                }
              />
              <Input
                type="number"
                className="w-20 h-7 bg-stone-700 rounded-none"
                value={control.count}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    handleControlChange(
                      index,
                      "count",
                      Math.min(Math.max(value, 0), 9999)
                    );
                  }
                }}
                min={0}
                max={9999}
                step={100}
              />
            </div>

            {/* Movement Select */}
            <div className="mt-1 flex items-center justify-between">
              <Label className="w-32">Movement</Label>{" "}
              {/* Adjusted label width */}
              <Select
                value={control.posFn}
                onValueChange={(value) =>
                  handleControlChange(index, "posFn", value)
                }
              >
                <SelectTrigger className="w-full bg-stone-700">
                  <SelectValue placeholder="Select a function" />
                </SelectTrigger>
                <SelectContent className="bg-stone-700">
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
            {control.posFn === "direction" && (
              <>
                <div className="mt-1 flex items-center justify-stretch gap-2">
                  <Label className="w-48">x-direction</Label>{" "}
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
                  <Input
                    type="number"
                    className="w-20 h-7 bg-stone-700 rounded-none"
                    value={control.dirx}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        handleControlChange(
                          index,
                          "dirx",
                          Math.min(Math.max(value, -5), 5)
                        );
                      }
                    }}
                    min={-5}
                    max={5}
                    step={0.1}
                  />
                </div>
                <div className="mt-1 flex items-center justify-stretch gap-2">
                  <Label className="w-48">y-direction</Label>{" "}
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
                  <Input
                    type="number"
                    className="w-20 h-7 bg-stone-700 rounded-none"
                    value={control.diry}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        handleControlChange(
                          index,
                          "diry",
                          Math.min(Math.max(value, -5), 5)
                        );
                      }
                    }}
                    min={-5}
                    max={5}
                    step={0.1}
                  />
                </div>
              </>
            )}

            {/* Color Picker Toggle */}
            <Collapsible className="mt-2 py-1 mr-32">
              <CollapsibleTrigger className="flex w-full h-8 items-center justify-between border border-stone-400 border-solid px-4 py-2 text-white hover:bg-stone-600">
                <div className="flex items-center gap-2">
                  Color
                  <div
                    className="h-4 w-4 ml-3 "
                    style={{ backgroundColor: control.color }}
                  />
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    colorPickerVisible[index] ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <ChromePicker
                  color={control.color}
                  onChange={(color) => handleColorChange(index, color)}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
    </div>
  );
}
