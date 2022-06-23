import React from "react";
import "antd/dist/antd.css";
import "./styles.css";

import { MultiTableDrag } from "./multi-table-drag";

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <MultiTableDrag />
    </div>
  );
}
