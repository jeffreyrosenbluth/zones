import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  visible: true,
  blx: 0,
  bly: 0,
  sizew: 300,
  sizeh: 300,
  domain: "constrained",
  radius: 1,
  count: 1000,
  posFn: "simple",
  dirx: 1,
  diry: 0,
  color: "#ff0000",
});

export default function App() {
  const [controls, setControls] = useState<RegionSettings[]>(initialControls);

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

  return (
    <div className="h-screen bg-background text-foreground p-8 overflow-auto">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(4, minmax(300px, 1fr))" }}
      >
        {controls.map((control, index) => (
          <div
            key={index}
            className="p-4 bg-card rounded-lg shadow-md dark:bg-card dark:text-card-foreground"
          >
            <h3 className="text-lg font-bold mb-4">Panel {index + 1}</h3>

            {/* Visibility Control */}
            <Button
              className="w-full"
              onClick={() =>
                handleControlChange(index, "visible", !control.visible)
              }
            >
              {control.visible ? "Hide" : "Show"}
            </Button>

            {/* Color Picker */}
            <div className="mt-4">
              <Label className="block mb-2 text-sm">Color</Label>
              <Input
                className="w-full"
                type="color"
                value={control.color}
                onChange={(e) =>
                  handleControlChange(index, "color", e.target.value)
                }
              />
            </div>

            {/* Domain Select */}
            <div className="mt-4">
              <Label className="block mb-2 text-sm">Domain</Label>
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
                    <SelectLabel>Domains</SelectLabel>
                    <SelectItem value="constrained">Constrained</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Position Function Select */}
            <div className="mt-4">
              <Label className="block mb-2 text-sm">Position Function</Label>
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
                    <SelectLabel>Position Functions</SelectLabel>
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
            <div className="mt-4 flex items-center justify-between">
              <Label className="mr-4">BLX:</Label>
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

            <div className="mt-4 flex items-center justify-between">
              <Label className="mr-4">BLY:</Label>
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
            <div className="mt-4 flex items-center justify-between">
              <Label className="mr-4">Width:</Label>
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

            <div className="mt-4 flex items-center justify-between">
              <Label className="mr-4">Height:</Label>
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
            <div className="mt-4 flex items-center justify-between">
              <Label className="mr-4">Radius:</Label>
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
            <div className="mt-4 flex items-center justify-between">
              <Label className="mr-4">Count:</Label>
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
            <div className="mt-4 flex items-center justify-between">
              <Label className="mr-4">Dir X:</Label>
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

            <div className="mt-4 flex items-center justify-between">
              <Label className="mr-4">Dir Y:</Label>
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
