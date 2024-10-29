/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from "react";
import useCanvasWindow from "@/art";
import { useState } from "react";
import { Label } from "@/components/ui/label";
// import { saveAs } from "file-saver";
import { FileSystemJsonStorage } from "./storage";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

import { ChromePicker, ColorResult } from "react-color";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import Numeric from "./numeric";
import { RegionSettings } from "./core";

const initialControls: RegionSettings[] = Array.from(
  { length: 16 },
  (_, index) => ({
    id: index,
    visible: false,
    tlx: 0,
    tly: 0,
    sizew: 500,
    sizeh: 500,
    radius: 1,
    count: 1000,
    posFn: "simple",
    dirx: 1,
    diry: 0,
    color: "rgba(255, 255, 255, 1)",
    tail: 50,
    dirty: false,
  })
);

export default function App() {
  const [controls, setControls] = useState<RegionSettings[]>(initialControls);

  const [localControls, setLocalControls] = useState<
    { [key: string]: number }[]
  >(controls.map(() => ({})));

  const [colorPickerVisible] = useState<boolean[]>(Array(16).fill(false));
  const { openCanvasWindow, newWindowRef } = useCanvasWindow();

  const storageRef = useRef(new FileSystemJsonStorage());

  const sendMessageToCanvas = (updatedSettings: RegionSettings[]) => {
    if (newWindowRef.current) {
      newWindowRef.current.postMessage(
        { type: "updateSettings", payload: updatedSettings },
        "*"
      );
    }
    for (const setting of updatedSettings) {
      if (setting.visible) setting.dirty = false;
    }
  };

  const handleKeyPress = useCallback(
    async (event: KeyboardEvent) => {
      if (event.key === "c") {
        openCanvasWindow();
        setTimeout(() => sendMessageToCanvas(controls), 100); // Small delay to ensure window is ready
      } else if (event.key === "s") {
        event.preventDefault();
        console.log("Current controls state:", controls);
        await saveDataToFile();
      } else if (event.key === "o") {
        event.preventDefault();
        await handleFileUpload();
      }
    },
    [controls, openCanvasWindow, sendMessageToCanvas]
  );

  const saveDataToFile = async () => {
    try {
      // Create a deep copy of the controls to ensure we capture all properties
      const dataToSave = {
        controls: controls.map((control) => ({ ...control })),
        timestamp: new Date().toISOString(),
      };

      console.log("Saving data:", dataToSave);
      await storageRef.current.save(dataToSave, true);
      console.log("Save successful");
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleFileUpload = async () => {
    try {
      const loadedData = await storageRef.current.load<{
        controls: RegionSettings[];
        timestamp: string;
      }>();

      console.log("Loaded data:", loadedData);

      if (!loadedData?.controls?.length) {
        throw new Error("Invalid data format");
      }

      // Validate and sanitize the loaded controls
      const sanitizedControls = loadedData.controls.map((control, index) => ({
        id: index,
        visible: Boolean(control.visible),
        tlx: Number(control.tlx) || 0,
        tly: Number(control.tly) || 0,
        sizew: Number(control.sizew) || 500,
        sizeh: Number(control.sizeh) || 500,
        radius: Number(control.radius) || 1,
        count: Number(control.count) || 1000,
        posFn: control.posFn || "simple",
        dirx: Number(control.dirx) || 1,
        diry: Number(control.diry) || 0,
        color: control.color || "rgba(255, 255, 255, 1)",
        tail: Number(control.tail) || 50,
        dirty: Boolean(control.dirty),
      }));

      // Update states
      setControls(sanitizedControls);
      setLocalControls(
        sanitizedControls.map((control) => ({
          tlx: control.tlx,
          tly: control.tly,
          sizew: control.sizew,
          sizeh: control.sizeh,
          radius: control.radius,
          count: control.count,
          tail: control.tail,
          dirx: control.dirx,
          diry: control.diry,
        }))
      );

      console.log("Load successful");
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

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
      dirty: true,
    };
    setControls(updatedControls);
  };

  useEffect(() => {
    setLocalControls(
      controls.map((control) => ({
        tlx: control.tlx,
        tly: control.tly,
        sizew: control.sizew,
        sizeh: control.sizeh,
        radius: control.radius,
        count: control.count,
        tail: control.tail,
        dirx: control.dirx,
        diry: control.diry,
      }))
    );
  }, [controls]);

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
            className="border-solid border-amber-500 border-2 rounded-none p-2 bg-background shadow-md dark:bg-background dark:text-card-foreground"
          >
            {/* Visibility Control using Shadcn Switch */}
            <div className="flex gap-4 items-center justify-center mb-1">
              <Label
                className="font-black text-amber-500"
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

            {/* x  */}
            <Numeric
              label="x"
              value={localControls[index]?.tlx ?? control.tlx}
              min={0}
              max={newWindowRef.current?.innerWidth || 1080}
              step={10}
              onValueChange={(value) =>
                handleControlChange(index, "tlx", value)
              }
            />

            {/* y  */}
            <Numeric
              label="y"
              value={localControls[index]?.tly ?? control.tly}
              min={0}
              max={newWindowRef.current?.innerHeight || 1080}
              step={10}
              onValueChange={(value) =>
                handleControlChange(index, "tly", value)
              }
            />

            {/* Width  */}
            <Numeric
              label="Width"
              value={localControls[index]?.sizew ?? control.sizew}
              min={0}
              max={newWindowRef.current?.innerWidth || 1080}
              step={10}
              onValueChange={(value) =>
                handleControlChange(index, "sizew", value)
              }
            />

            {/* Height  */}
            <Numeric
              label="Height"
              value={localControls[index]?.sizeh ?? control.sizeh}
              min={0}
              max={newWindowRef.current?.innerHeight || 1080}
              step={10}
              onValueChange={(value) =>
                handleControlChange(index, "sizeh", value)
              }
            />

            <Separator className="bg-stone-300 my-3" />

            {/* Radius  */}
            <Numeric
              label="Radius"
              value={localControls[index]?.radius ?? control.radius}
              min={0.5}
              max={20}
              step={0.5}
              onValueChange={(value) =>
                handleControlChange(index, "radius", value)
              }
            />

            {/* Count*/}
            <Numeric
              label="Count"
              value={localControls[index]?.count ?? control.count}
              min={0}
              max={9999}
              step={100}
              onValueChange={(value) =>
                handleControlChange(index, "count", value)
              }
            />

            {/* Trail */}
            <Numeric
              label="Trail"
              value={localControls[index]?.tail ?? control.tail}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) =>
                handleControlChange(index, "tail", value)
              }
            />

            <Separator className="bg-stone-300 my-3" />

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
                      t-Distribution Walk
                    </SelectItem>
                    <SelectItem value="simplex">Swirl</SelectItem>
                    <SelectItem value="cosY">Sinusoid Horizontal</SelectItem>
                    <SelectItem value="cosX">Sinusoid Vertical</SelectItem>
                    <SelectItem value="cosXY">Sinusoid</SelectItem>
                    <SelectItem value="direction">Direction</SelectItem>
                    <SelectItem value="flowfield">Flow</SelectItem>
                    <SelectItem value="still">Still</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Direction X and Y Sliders */}
            {control.posFn === "direction" && (
              <>
                <Numeric
                  label="x-direction"
                  labelWidth="w-48"
                  value={localControls[index]?.dirx ?? control.dirx}
                  min={-5}
                  max={5}
                  step={0.1}
                  onValueChange={(value) =>
                    handleControlChange(index, "dirx", value)
                  }
                />
                <Numeric
                  label="y-direction"
                  labelWidth="w-48"
                  value={localControls[index]?.diry ?? control.diry}
                  min={-5}
                  max={5}
                  step={0.1}
                  onValueChange={(value) =>
                    handleControlChange(index, "diry", value)
                  }
                />
              </>
            )}

            {/* Color Picker Toggle */}
            <Collapsible className="mt-2 py-1 mr-32">
              <CollapsibleTrigger className="flex w-full h-8 items-center justify-between border border-stone-400 border-solid px-4 py-2 text-white hover:bg-stone-600">
                <div className="flex items-center gap-2 text-sm">
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
