import type { UserList } from "@/lib/api";

type VisibilityValue = UserList["visibility"];

type VisibilitySelectorProps = {
  disabled?: boolean;
  legend?: string;
  name: string;
  onChange: (value: VisibilityValue) => void;
  value: VisibilityValue;
};

const options: Array<{
  helper: string;
  label: string;
  value: VisibilityValue;
}> = [
  {
    helper: "لا تظهر إلا لك.",
    label: "خاص",
    value: "private"
  },
  {
    helper: "يمكن للمستخدمين المسجلين رؤيتها.",
    label: "عام",
    value: "public"
  }
];

export function VisibilitySelector({
  disabled = false,
  legend = "ظهور القائمة",
  name,
  onChange,
  value
}: VisibilitySelectorProps) {
  return (
    <fieldset className="ds-visibility">
      <legend>{legend}</legend>
      <div className="ds-visibility__grid">
        {options.map((option) => (
          <label className="ds-visibility__option" key={option.value}>
            <input
              checked={value === option.value}
              disabled={disabled}
              name={name}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span className="ds-visibility__label">{option.label}</span>
            <span className="muted">{option.helper}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
