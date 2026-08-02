"use client";

const CATEGORIES = [
  "general",
  "anime",
  "nature",
  "abstract",
  "gaming",
  "minimal",
  "dark",
  "amoled",
  "cars",
  "space",
  "fantasy",
  "cityscape",
];

const inputClass =
  "w-full rounded-xl border border-line bg-canvas/80 px-3 py-2.5 text-sm text-fog outline-none focus:border-accent/50";

function EditPinFormFields({
  title,
  setTitle,
  description,
  setDescription,
  prompt,
  setPrompt,
  category,
  setCategory,
  deviceType,
  setDeviceType,
  board,
  setBoard,
  albums,
  tags,
  setTags,
  link,
  setLink,
}) {
  return (
    <>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted">AI Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none font-mono text-xs`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">Device</label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            className={inputClass}
          >
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted">Album</label>
        <select
          value={board}
          onChange={(e) => setBoard(e.target.value)}
          className={inputClass}
        >
          <option value="">No album (uncategorized)</option>
          {albums.map((album) => (
            <option key={album._id} value={album._id}>
              {album.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted">Tags</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="comma, separated, tags"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted">Source link</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>
    </>
  );
}

export default EditPinFormFields;
