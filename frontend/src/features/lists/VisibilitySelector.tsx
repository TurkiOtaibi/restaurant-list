import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

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
  const legendId = `${name}-legend`;

  return (
    <fieldset className="ds-visibility">
      <legend id={legendId}>{legend}</legend>
      <RadioGroup<ListVisibility>
        aria-labelledby={legendId}
        className="ds-visibility__grid"
        disabled={disabled}
        name={name}
        onValueChange={onChange}
        value={value}
      >
        {LIST_VISIBILITY_OPTIONS.map((option) => (
          <label className="ds-visibility__option" key={option.value}>
            <Radio.Root className="ds-visibility__radio" value={option.value}>
              <Radio.Indicator className="ds-visibility__indicator" />
            </Radio.Root>
            <span className="ds-visibility__label">{option.label}</span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
