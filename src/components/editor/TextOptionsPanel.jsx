"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";

function TextOptionsPanel({ textOptions, setTextOptions }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">
        <span className="font-medium">Font Size</span>
        <input
          type="number"
          value={textOptions.fontSize}
          onChange={(e) =>
            setTextOptions({
              ...textOptions,
              fontSize: parseInt(e.target.value),
            })
          }
          className="border border-[#e0e0e0] rounded-lg p-4"
        />
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <span>Color</span>
        <div className="relative">
          <div
            className="w-9 h-9 rounded-full cursor-pointer"
            style={{ backgroundColor: textOptions.color }}
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
          />
          {isColorPickerOpen && (
            <div className="absolute">
              <HexColorPicker
                color={textOptions.color}
                onChange={(color) =>
                  setTextOptions({ ...textOptions, color })
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextOptionsPanel;
