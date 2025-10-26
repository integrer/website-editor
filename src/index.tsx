import ReactDOM from "react-dom/client";
import "./index.css";
import * as ReactRedux from "react-redux";
import { store } from "./config";
import { DBInitGate } from "./components/dbInitGate";
import { Editor } from "./components/editor";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <ReactRedux.Provider store={store}>
    <DBInitGate>
      <Editor />
    </DBInitGate>
  </ReactRedux.Provider>
);
