"use client";

import useEditStore from "@/stores/editorStore";
import TextOptionsPanel from "./TextOptionsPanel";
import CanvasOptionsPanel from "./CanvasOptionsPanel";

function Options({ previewImg }) {
  const { selectedLayer, textOptions, setTextOptions, canvasOptions, setCanvasOptions } =
    useEditStore();

  return (
    <div className="flex-1 mt-8">
      {selectedLayer === "text" ? (
        <TextOptionsPanel
          textOptions={textOptions}
          setTextOptions={setTextOptions}
        />
      ) : (
        <CanvasOptionsPanel
          canvasOptions={canvasOptions}
          setCanvasOptions={setCanvasOptions}
          previewImg={previewImg}
        />
      )}
    </div>
  );
}

export default Options;
