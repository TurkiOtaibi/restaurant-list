import { LIST_VISIBILITY_OPTIONS, ListVisibility } from "@/lib/listVisibility";

type VisibilitySelectorProps = {
  disabled?: boolean;
  legend?: string;
  name: string;
  onChange: (value: ListVisibility) => void;
  value: ListVisibility;
};

export function VisibilitySelector({
  disabled = false,
  legend = "الخصوصية",
  name,
  onChange,
  value
}: VisibilitySelectorProps) {
  return (
    <fieldset className="ds-visibility">
      <legend>{legend}</legend>
      <div className="ds-visibility__grid">
        {LIST_VISIBILITY_OPTIONS.map((option) => (
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
          </label>
        ))}
      </div>
    </fieldset>
  );
}
