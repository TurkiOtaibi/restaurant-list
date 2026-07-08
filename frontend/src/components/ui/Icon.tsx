import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ShelfIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 6h14" />
      <path d="M7 6v12" />
      <path d="M17 6v12" />
      <path d="M5 18h14" />
      <path d="M10 9h4" />
      <path d="M10 13h4" />
    </BaseIcon>
  );
}

export function RestaurantIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 4v16" />
      <path d="M5 4v5a2 2 0 0 0 4 0V4" />
      <path d="M15 4v16" />
      <path d="M15 4c3 1.5 4 4.2 4 7h-4" />
    </BaseIcon>
  );
}

export function CafeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
      <path d="M16 10h1.5a2 2 0 0 1 0 4H16" />
      <path d="M7 4v1" />
      <path d="M11 4v1" />
      <path d="M4 20h16" />
    </BaseIcon>
  );
}

export function ArchiveIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 7h14v12H5z" />
      <path d="M7 4h10l2 3H5l2-3Z" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </BaseIcon>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16l-5-3-5 3V5Z" />
    </BaseIcon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </BaseIcon>
  );
}

export function IceCreamIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 11a4 4 0 0 1 8 0" />
      <path d="M7.5 11h9" />
      <path d="M9 11l3 9 3-9" />
    </BaseIcon>
  );
}

export function TasteMarkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4v16" />
      <path d="M6 10c2-4 10-4 12 0" />
      <path d="M8 15c1.5 2 6.5 2 8 0" />
    </BaseIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </BaseIcon>
  );
}

export function ClearIcon(props: IconProps) {
  return <CloseIcon {...props} />;
}

export function AddIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M15 6l-6 6 6 6" />
    </BaseIcon>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 6h14" />
      <path d="M8 12h8" />
      <path d="M10 18h4" />
    </BaseIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </BaseIcon>
  );
}

export function MoreVerticalIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5h.01" />
      <path d="M12 12h.01" />
      <path d="M12 19h.01" />
    </BaseIcon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 20h4" />
      <path d="M14.5 5.5l4 4" />
      <path d="M17 3l4 4L8 20H4v-4L17 3Z" />
    </BaseIcon>
  );
}

export function DeleteIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 7h14" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M9 7V4h6v3" />
    </BaseIcon>
  );
}
