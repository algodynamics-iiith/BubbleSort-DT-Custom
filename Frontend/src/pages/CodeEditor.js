import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { languagesToMonacoId, languagesToId } from "./data/languages";
import { algorithmsIdToTemplate, dbIdToAlgorithmId } from "./data/algorithms";
import { encode, decode } from "./Utils";
import encodedTestCases from "./data/testCases";
import client from "./api";
import Swal from "sweetalert2";
import config from "./Config";
import { PulseLoader } from "react-spinners";
import codeInstructions from "./data/codeInstructions";

const CodeEditor = () => {
  const [algorithmId, setAlgorithmId] = useState(1);
  const [userId, setUserId] = useState(null);
  const [language, setLanguage] = useState("C (GCC 9.2.0)");
  const [value, setValue] = useState(algorithmsIdToTemplate[algorithmId]);
  const [disabledS, setDisabledS] = useState(false);
  const [disabledT, setDisabledT] = useState(false);

  const [output, setOutput] = useState("Output Test/Submit will display here!");
  const [loading, setLoading] = useState(false);

  const { minValidStatus, maxValidStatus } = config.judge0;
  const { testCasesCount } = config;
  const { compilation } = config.errors;
  const { theme } = config.editor;
  // const { lengthArray, minValue, maxValue } = config[algorithmId];

  const leftPanel = codeInstructions[algorithmId];

  useEffect(() => {
    let algorithmId = localStorage.getItem("algorithmId");
    const temp_code = localStorage.getItem("code");
    algorithmId = dbIdToAlgorithmId[algorithmId];
    setAlgorithmId(algorithmId);
    setUserId(localStorage.getItem("userId"));
    if (temp_code !== null) {
      setValue(JSON.parse(temp_code));
    } else {
      setValue(algorithmsIdToTemplate[algorithmId]);
    }
  }, []);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.getDomNode().addEventListener(
      "paste",
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
      true
    );
  };

  const onChangeText = (newValue, e) => {
    value[language] = newValue;
    setValue(value);
  };

  const displayText = (submissions) => {
    return submissions
      .map((x, i) => `Test Case ${i + 1} : ${x.status.description}`)
      .join("\n");
  };

  const showTestOutput = (submissions) => {
    const op = submissions[0].stdout;
    if (op !== null) return decode(op);
    else return submissions[0].status.description;
  };

  const validateInput = (input) => {
    // const splittedInput = input.trim().split("\n");
    // if (splittedInput.length < 2)
    //   return {
    //     message: "There should be two lines in input.",
    //     flag: false,
    //   };
    // else {
    //   const n = parseInt(splittedInput[0].trim());
    //   if (isNaN(n) || (!isNaN(n) && (n < 0 || n > lengthArray)))
    //     return {
    //       message: "First line should be a valid number.",
    //       flag: false,
    //     };
    //   else {
    //     const a = splittedInput[1].trim().split(" ");

    //     if (
    //       a
    //         .filter((x) => !isNaN(x))
    //         // .filter(!isNaN)

    //         .filter((x) => x >= minValue && x <= maxValue).length !== n
    //     )
    //       return {
    //         message: `There should be exactly ${n} numbers.`,
    //         flag: false,
    //       };
    //     else 
        return { message: "Okay!", flag: true };
      // }
    // }
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const swalError = (message) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      footer: "Please try again.",
    });
  };
  const submitCode = async (
    count,
    display,
    disabled,
    test,
    inputs,
    outputs
  ) => {
    localStorage.setItem("code", JSON.stringify(value));
    disabled(true);
    setOutput("");

    Toast.fire({
      icon: "success",
      title: "Submitted Successfully!",
    });

    const encodedCode = encode(value[language]);

    setLoading(true);
    await client
      .post(
        "/submitCode",
        JSON.stringify({
          id: userId,
          source_code: encodedCode,
          language_id: languagesToId[language],
          inputs,
          outputs,
          test,
        })
      )
      .then((response) => {
        setLoading(false);
        let submissions = response.data.submissions;

        let filteredSubmission = submissions.filter(
          (x) => x.status.id >= minValidStatus && x.status.id <= maxValidStatus
        );
        if (filteredSubmission.length === count) {
          if (submissions[0].status.id === compilation) {
            setOutput(decode(submissions[0].compile_output));
          } else {
            setOutput(display(submissions));
          }
        } else {
          swalError("Something went wrong(Server)!");
        }
      })
      .catch((error) => {
        setLoading(false);
        swalError("Server is busy!");
      });
    disabled(false);
  };

  const onClickSubmit = async (e) => {
    submitCode(
      testCasesCount,
      displayText,
      setDisabledS,
      false,
      encodedTestCases.inputs,
      encodedTestCases.outputs
    );
  };

  const onClickNext = () => {
    // to be implemented
    Swal.fire({
      title: "Are you sure you want to submit?",
      text: "You would not be able to go back!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Submit and move to Next Section",
      backdrop: true,
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        onClickSubmit;
        let current = parseInt(localStorage.getItem("current"));
        current++;
        localStorage.setItem("current", current);
        let desiredPath = JSON.parse(localStorage.getItem("path"))[current];
        if (current !== 2) {
          window.location.pathname = window.location.pathname.slice(1, 21) + desiredPath;
        } else {
          // window.location.href = desiredPath;
          window.location.pathname = window.location.pathname.slice(1, 21) + desiredPath;
        }
      }
    });
  };
  const onClickTest = async (e) => {
    Swal.fire({
      title: "Enter Custom Input",
      input: "textarea",
      inputValue: "4\n4 3 2 1",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Submit",
      showLoaderOnConfirm: true,
      preConfirm: (input) => {
        const { message, flag } = validateInput(input);
        if (flag)
          submitCode(
            1,
            showTestOutput,
            setDisabledT,
            true,
            [encode(input)],
            []
          );
        else {
          Toast.fire({
            icon: "error",
            title: message,
          });
        }
      },
      backdrop: true,
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  return (
    <div className="flex flex-grow overflow-hidden">
      {/* Beautify the div */}
      {/* Add border */}
      <div style={{ height: "100%" }} className="overflow-y-scroll p-4 prose">
        <h1>Problem Description</h1>
        <p>{leftPanel["Problem Description"]}</p>
        <h1>General Instructions</h1>
        <ol>
          {leftPanel["General Instructions"].map((instr, i) => (
            <li key={i}>{instr}</li>
          ))}
        </ol>
        <h1>Platform Instructions</h1>
        <ol>
          {leftPanel["Platform Instructions"].map((instr, i) => (
            <li key={i}>{instr}</li>
          ))}
        </ol>
        <h1>Problem Constraints</h1>
        <ol>
          {leftPanel["Problem Constraints"].map((instr, i) => (
            <li key={i}>{instr}</li>
          ))}
        </ol>
        <h1>Input Format</h1>
        <p>{leftPanel["Input Format"]}</p>
        <h1>Output Format</h1>
        <p>{leftPanel["Output Format"]}</p>
        <h1>Example Input</h1>
        <pre>{leftPanel["Example Input"]}</pre>
        <h1>Example Output</h1>
        <pre>{leftPanel["Example Output"]}</pre>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flexGrow: "1",
        }}
      >
        {/* Add three buttons side by side */}
        {/* One for language select */}
        {/* One to test */}
        {/* One to submit */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <label>Language: </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {Object.keys(languagesToMonacoId).map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              width: "50%",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <button
              onClick={onClickTest}
              disabled={disabledT}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 m-1 rounded"
            >
              Test Run Code
            </button>
            <button
              onClick={onClickSubmit}
              disabled={disabledS}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 m-1 rounded"
            >
              Submit Code
            </button>
            <button
              onClick={onClickNext}
              disabled={disabledS}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 m-1 rounded"
            >
              Next Section
            </button>
          </div>
        </div>
        <Editor
          height="65vh"
          language={languagesToMonacoId[language]}
          theme={theme}
          value={value[language]}
          onChange={onChangeText}
          onMount={handleEditorDidMount}
          quickSuggestions={false}
        />

        <div>
          <PulseLoader loading={loading} color="#36D7B7" />
          <pre
            style={{ width: "100%", height: "15vh" }}
            className={("overflow-y-scroll", "overflow-x-scroll")}
          >
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
