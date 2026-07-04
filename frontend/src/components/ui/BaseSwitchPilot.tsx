"use client";

import { Switch } from "@base-ui/react/switch";
import { useId, useState } from "react";

export function BaseSwitchPilot() {
  const [enabled, setEnabled] = useState(false);
  const labelId = useId();
  const descriptionId = useId();
  const switchLabelId = useId();

  return (
    <section className="base-switch-pilot" aria-labelledby={labelId}>
      <div className="base-switch-pilot__copy">
        <h2 id={labelId}>تجربة مفتاح الواجهة</h2>
        <p id={descriptionId}>مفتاح تقني معزول لا يغير أي إعداد أو بيانات في التطبيق.</p>
      </div>
      <label className="base-switch-pilot__control">
        <span className="base-switch-pilot__label" id={switchLabelId}>
          تفعيل المعاينة
        </span>
        <Switch.Root
          aria-describedby={descriptionId}
          aria-labelledby={switchLabelId}
          checked={enabled}
          className="base-switch-pilot__switch"
          onCheckedChange={setEnabled}
        >
          <Switch.Thumb className="base-switch-pilot__thumb" />
        </Switch.Root>
      </label>
      <p className="base-switch-pilot__state" aria-live="polite">
        {enabled ? "المعاينة مفعلة محليًا فقط." : "المعاينة غير مفعلة."}
      </p>
    </section>
  );
}
