import { FC } from "react";
import { Preview } from "./preview";
import { Properties } from "./properties";

export const Editor: FC = () => (
  <div className="editor">
    <Preview />

    <Properties />
  </div>
);
