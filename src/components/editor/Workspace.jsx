"use client";

import { useEffect, useRef } from "react";
import useEditStore from "@/stores/editorStore";
import { HiTrash } from "react-icons/hi2";

function Workspace({ previewImg }) {
  const { setSelectedLayer, textOptions, setTextOptions, canvasOptions, setCanvasOptions } =
    useEditStore();

  useEffect(() => {
    if (canvasOptions.height === 0) {
      const canvasHeight = (375 * previewImg.height) / previewImg.width;
      setCanvasOptions({
        ...canvasOptions,
        height: canvasHeight,
        orientation: canvasHeight > 375 ? "portrait" : "landscape",
      });
    }
  }, [previewImg, canvasOptions, setCanvasOptions]);

  const itemRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    setTextOptions({
      ...textOptions,
      left: e.clientX - offset.current.x,
      top: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  const handleMouseDown = (e) => {
    setSelectedLayer("text");
    dragging.current = true;
    offset.current = {
      x: e.clientX - textOptions.left,
      y: e.clientY - textOptions.top,
    };
  };

  const handleMouseLeave = () => {
    dragging.current = false;
  };

  return (
    <div
      className="flex-[3] flex items-center justify-center bg-[#e9e9e9] py-16"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="w-[375px] rounded-[32px] overflow-hidden flex items-center justify-center relative bg-gray-500"
        style={{
          height: canvasOptions.height,
          backgroundColor: canvasOptions.backgroundColor,
        }}
      >
        <img src={previewImg.url} alt="" className="w-full" />
        {textOptions.text && (
          <div
            className="absolute z-[999] max-w-full border border-dashed border-red-500"
            style={{
              left: textOptions.left,
              top: textOptions.top,
              fontSize: `${textOptions.fontSize}px`,
            }}
            ref={itemRef}
            onMouseDown={handleMouseDown}
          >
            <input
              type="text"
              value={textOptions.text}
              onChange={(e) =>
                setTextOptions({ ...textOptions, text: e.target.value })
              }
              style={{ color: textOptions.color }}
              className="border-none bg-transparent outline-none w-full cursor-grab"
            />
            <div
              className="absolute -top-9 right-0 bg-white w-8 h-8 flex items-center justify-center p-2 rounded-full cursor-pointer"
              onClick={() =>
                setTextOptions({ ...textOptions, text: "" })
              }
            >
              <HiTrash size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Workspace;
