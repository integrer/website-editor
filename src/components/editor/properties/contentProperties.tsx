import { ChangeEventHandler, FC, ReactNode, useCallback, useEffect, useState } from "react";
import { Icons } from "../../icons";
import { ContentModel, TextAlign } from "../../../config";
import { ButtonGroup, SelectButton } from "./buttonGroup";

const TextInput: FC<{
  label: ReactNode;
  id: string;
  value: string;
  onChange?: (value: string) => void;
}> = ({ id, label, value, onChange }) => {
  const [innerValue, setInnerValue] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setInnerValue(value);
  }, [focused, value]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      const newValue = ev.target.value;
      onChange?.(newValue);
      setInnerValue(newValue);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <div className="text-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" value={innerValue} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
    </div>
  );
};

const ImageContentProperties: FC<{
  content: Extract<ContentModel, { kind: "image" }>;
  onChange?: (content: ContentModel) => void;
}> = ({ content, onChange }) => {
  const handleChangeUrl = useCallback((url: string) => onChange?.({ ...content, url }), [content, onChange]);
  const handleChangeAlt = useCallback((alt: string) => onChange?.({ ...content, alt }), [content, onChange]);
  return (
    <div className="section">
      <div className="section-header">Image</div>
      <TextInput value={content.url || ""} id="image-url" label="URL" onChange={handleChangeUrl} />
      <TextInput value={content.alt || ""} id="image-alt" label="alt" onChange={handleChangeAlt} />
    </div>
  );
};

const TextareaField: FC<{ rows: number; placeholder: string; value: string; onChange?: (value: string) => void }> = ({
  rows,
  placeholder,
  value,
  onChange,
}) => {
  const [innerValue, setInnerValue] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setInnerValue(value);
  }, [focused, value]);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (ev) => {
      const newValue = ev.target.value;
      onChange?.(newValue);
      setInnerValue(newValue);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <div className="textarea-field">
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={innerValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
};

const TextContentProperties: FC<{
  content: Extract<ContentModel, { kind: "text" }>;
  onChange?: (content: ContentModel) => void;
}> = ({ content, onChange }) => {
  const handleChangeAlign = useCallback(
    (value: TextAlign) => {
      return onChange?.({ ...content, align: value });
    },
    [content, onChange]
  );

  const handleChangeText = useCallback((value: string) => onChange?.({ ...content, text: value }), [content, onChange]);
  return (
    <div className="section">
      <div className="section-header">Text</div>
      <div className="button-group-field">
        <label>Alignment</label>
        <ButtonGroup value={content.align} onChange={handleChangeAlign}>
          <SelectButton value={TextAlign.left}>
            <Icons.TextAlignLeft />
          </SelectButton>
          <SelectButton value={TextAlign.center}>
            <Icons.TextAlignCenter />
          </SelectButton>
          <SelectButton value={TextAlign.right}>
            <Icons.TextAlignRight />
          </SelectButton>
        </ButtonGroup>
      </div>
      <TextareaField rows={8} placeholder="Enter text" value={content.text} onChange={handleChangeText} />
    </div>
  );
};

export const ContentProperties: FC<{ content: ContentModel; onChange?: (content: ContentModel) => void }> = ({
  content,
  onChange,
}) => {
  if (content.kind === "image") return <ImageContentProperties content={content} onChange={onChange} />;

  return <TextContentProperties content={content} onChange={onChange} />;
};
