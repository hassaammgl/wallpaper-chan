"use client";

import Link from "next/link";
import { HiPhoto } from "react-icons/hi2";
import { inputClass, CATEGORIES } from "@/components/create/createConstants";
import {
  Field,
  DeviceTypeField,
  QuickTagsField,
} from "@/components/create/CreateFormMeta";
import CreateFormActions from "@/components/create/CreateFormActions";

export default function CreateForm({ c }) {
  return (
    <form
      className="space-y-4 rounded-[28px] border border-line glass p-6"
      onSubmit={(e) => {
        e.preventDefault();
        c.publishWallpaper();
      }}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
        <HiPhoto size={14} />
        Wallpaper details
      </div>

      <DeviceTypeField
        deviceType={c.deviceType}
        setDeviceType={c.setDeviceType}
      />

      <Field id="title" label="Title *">
        <input
          type="text"
          placeholder="Give it a title"
          id="title"
          value={c.title}
          onChange={(e) => c.setTitle(e.target.value)}
          required
          className={inputClass}
        />
      </Field>

      <Field id="description" label="Description *">
        <textarea
          placeholder="Describe your wallpaper"
          id="description"
          value={c.description}
          onChange={(e) => c.setDescription(e.target.value)}
          rows="3"
          required
          className={`${inputClass} resize-none`}
        />
      </Field>

      <Field id="prompt" label="AI Prompt">
        <textarea
          placeholder="Paste the prompt used to generate this wallpaper (optional)"
          id="prompt"
          value={c.prompt}
          onChange={(e) => c.setPrompt(e.target.value)}
          rows="2"
          className={`${inputClass} resize-none font-mono text-xs`}
        />
      </Field>

      <Field id="category" label="Category">
        <select
          id="category"
          value={c.category}
          onChange={(e) => c.setCategory(e.target.value)}
          className={inputClass}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </Field>

      <QuickTagsField selectedTags={c.selectedTags} toggleTag={c.toggleTag} />

      <Field id="tags" label="Custom tags">
        <input
          type="text"
          placeholder="Add more tags, comma separated"
          id="tags"
          value={c.customTags}
          onChange={(e) => c.setCustomTags(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field id="album" label="Album">
        <select
          id="album"
          value={c.selectedAlbum}
          onChange={(e) => c.setSelectedAlbum(e.target.value)}
          className={inputClass}
        >
          <option value="">No album (uncategorized)</option>
          {c.albums.map((album) => (
            <option key={album._id} value={album._id}>
              {album.title}
            </option>
          ))}
        </select>
        {c.albums.length === 0 && c.currentUser?.userName && (
          <p className="text-xs text-muted">
            No albums yet.{" "}
            <Link
              href={`/${c.currentUser.userName}?tab=albums`}
              className="text-accent hover:underline"
            >
              Create one on your profile
            </Link>
          </p>
        )}
      </Field>

      <Field id="link" label="Source link">
        <input
          type="text"
          placeholder="https://..."
          id="link"
          value={c.link}
          onChange={(e) => c.setLink(e.target.value)}
          className={inputClass}
        />
      </Field>

      <CreateFormActions c={c} />
    </form>
  );
}
