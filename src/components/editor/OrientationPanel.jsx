function OrientationPanel({ orientation, onOrientationClick }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <span className="font-medium">Orientation</span>
      <div className="p-1 rounded-lg bg-[rgba(242,239,239,0.968)] flex text-sm font-medium w-max">
        <div
          className={`p-2 rounded-lg min-w-9 flex items-center justify-center cursor-pointer ${
            orientation === "portrait" ? "bg-white" : ""
          }`}
          onClick={() => onOrientationClick("portrait")}
        >
          P
        </div>
        <div
          className={`p-2 rounded-lg min-w-9 flex items-center justify-center cursor-pointer ${
            orientation === "landscape" ? "bg-white" : ""
          }`}
          onClick={() => onOrientationClick("landscape")}
        >
          L
        </div>
      </div>
    </div>
  );
}

export default OrientationPanel;
