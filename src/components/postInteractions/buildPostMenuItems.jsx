import {
  HiLink,
  HiArrowDownTray,
  HiBookmark,
  HiPencilSquare,
  HiTrash,
  HiFlag,
} from "react-icons/hi2";

export function buildPostMenuItems({
  isAdmin,
  isSaved,
  onCopyLink,
  onDownload,
  onSave,
  onEditAdmin,
  onDelete,
  onReport,
}) {
  return [
    {
      label: "Copy link",
      icon: <HiLink size={16} />,
      onClick: onCopyLink,
    },
    {
      label: "Download",
      icon: <HiArrowDownTray size={16} />,
      onClick: onDownload,
    },
    {
      label: isSaved ? "Unsave" : "Save",
      icon: <HiBookmark size={16} />,
      onClick: onSave,
    },
    isAdmin && {
      label: "Edit in admin",
      icon: <HiPencilSquare size={16} />,
      onClick: onEditAdmin,
    },
    isAdmin && {
      label: "Delete wallpaper",
      icon: <HiTrash size={16} />,
      danger: true,
      onClick: onDelete,
    },
    !isAdmin && {
      label: "Report",
      icon: <HiFlag size={16} />,
      onClick: onReport,
    },
  ];
}
