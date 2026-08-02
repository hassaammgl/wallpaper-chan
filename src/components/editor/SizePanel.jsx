import { portraitSizes, landscapeSizes } from "./editorSizes";

function SizePanel({ orientation, size, onSizeClick }) {
  const sizes = orientation === "portrait" ? portraitSizes : landscapeSizes;

  return (
    <div className="flex flex-col gap-2 mb-4">
      <span className="font-medium">Size</span>
      <div className="p-1 rounded-lg bg-[rgba(242,239,239,0.968)] flex text-sm font-medium w-max">
        <div
          className={`p-2 rounded-lg min-w-9 flex items-center justify-center cursor-pointer ${
            size === "original" ? "bg-white" : ""
          }`}
          onClick={() => onSizeClick("original")}
        >
          Original
        </div>
        {sizes.map((item) => (
          <div
            className={`p-2 rounded-lg min-w-9 flex items-center justify-center cursor-pointer ${
              size === item.name ? "bg-white" : ""
            }`}
            key={item.name}
            onClick={() => onSizeClick(item)}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SizePanel;
