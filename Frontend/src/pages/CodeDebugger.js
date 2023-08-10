import { useState } from "react";
import Editor from "@monaco-editor/react";

const CodeDebugger = () => {
  const [value, setValue] = useState(
    '#include<"stdio.h">\nint printMe(int n){\n    printf("%s", n);\n}'
  );
  const [language, setLanguage] = useState("c");
  const [theme, setTheme] = useState("vs-dark");

  const onChange = (newValue, e) => {
    setValue(newValue);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Beautify the div */}
      {/* Add border */}
      <div style={{ width: "50%" }}>
        <p>This is the problem:</p>
        <p>Debug the given function, to print the value</p>
      </div>
      <div style={{ display: "flex", width: "50%", flexDirection: "column" }}>
        <div>
          {/* Add three buttons side by side */}
          {/* One for language select */}
          {/* One to test */}
          {/* One to submit */}
          <div style={{ display: "flex" }}>
            <div style={{ width: "50%" }}>
              <label>Language: </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="c++">C++</option>
                <option value="c">C</option>
                <option value="ruby">Ruby</option>
              </select>
            </div>
            <div
              style={{
                width: "50%",
              }}
            >
              <button>Test</button>
              <button>Debug</button>
            </div>
          </div>
          <Editor
            height="77vh"
            language={language}
            theme={theme}
            value={value}
            onChange={onChange}
            quickSuggestions={false}
          />
        </div>
        {/* Create box of height 100px */}
        <div style={{ height: "100px" }}>
          {/* Add a button to change theme */}
          <button
            onClick={() => setTheme(theme === "vs-dark" ? "vs" : "vs-dark")}
          >
            Change theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeDebugger;
