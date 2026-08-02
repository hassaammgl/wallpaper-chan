"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import OrientationPanel from "./OrientationPanel";
import SizePanel from "./SizePanel";

function CanvasOptionsPanel({
  canvasOptions,
  setCanvasOptions,
  previewImg,
}) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const originalOrientation =
    previewImg.width < previewImg.height ? "portrait" : "landscape";

  const handleOrientationClick = (orientation) => {
    let newHeight;
    if (
      (originalOrientation === "portrait" && orientation === "portrait") ||
      (originalOrientation === "landscape" && orientation === "landscape")
    ) {
      newHeight = (375 * previewImg.height) / previewImg.width;
    } else {
      newHeight = (375 * previewImg.width) / previewImg.height;
    }

    setCanvasOptions({
      ...canvasOptions,
      orientation,
      size: "original",
      height: newHeight,
    });
  };

  const handleSizeClick = (size) => {
    let newHeight;
    if (size === "original") {
      if (
        (originalOrientation === "portrait" &&
          canvasOptions.orientation === "portrait") ||
        (originalOrientation === "landscape" &&
          canvasOptions.orientation === "landscape")
      ) {
        newHeight = (375 * previewImg.height) / previewImg.width;
      } else {
        newHeight = (375 * previewImg.width) / previewImg.height;
      }
    } else {
      newHeight = (375 * size.height) / size.width;
    }

    setCanvasOptions({ ...canvasOptions, size: size.name, height: newHeight });
  };

  return (
    <div>
      <OrientationPanel
        orientation={canvasOptions.orientation}
        onOrientationClick={handleOrientationClick}
      />
      <SizePanel
        orientation={canvasOptions.orientation}
        size={canvasOptions.size}
        onSizeClick={handleSizeClick}
      />
      <div className="flex flex-col gap-2 mb-4">
        <span className="font-medium">Background color</span>
        <div className="relative">
          <div
            className="w-9 h-9 rounded-full cursor-pointer"
            style={{ backgroundColor: canvasOptions.backgroundColor }}
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
          />
          {isColorPickerOpen && (
            <div className="absolute">
              <HexColorPicker
                color={canvasOptions.backgroundColor}
                onChange={(backgroundColor) =>
                  setCanvasOptions({ ...canvasOptions, backgroundColor })
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CanvasOptionsPanel;
