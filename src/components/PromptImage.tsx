import { useState } from "react";
import { MockImage } from "@/components/MockImage";
import { evalPrompts, modelPalette, USE_REAL_IMAGES, type ModelId } from "@/data";

interface Props {
  promptId: string;
  modelId: ModelId;
  className?: string;
  label: string;
}

/** Shows the generated image for a prompt + model, or a placeholder illustration if it is not available. */
export function PromptImage({ promptId, modelId, className, label }: Props) {
  const [failed, setFailed] = useState(false);
  const prompt = evalPrompts.find((p) => p.id === promptId)!;

  if (USE_REAL_IMAGES && !failed) {
    return (
      <img
        src={`/images/${promptId}-${modelId}.png`}
        alt={label}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className ?? ""} object-cover`}
      />
    );
  }
  return <MockImage product={prompt.product} palette={modelPalette[modelId]} className={className} label={label} />;
}
