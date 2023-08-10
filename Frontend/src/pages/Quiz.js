import { useEffect, useState } from "react";
// import { quiz as heapQ } from "./quiz_templates/heapQuiz";
import { quiz as bubbleQ } from "./quiz_templates/bubbleQuiz";
// import { quiz as factQ} from "./quiz_templates/factQuiz";
import { dbIdToAlgorithmId } from "./data/algorithms";
import Swal from "sweetalert2";
import { quizInstructions } from "./quiz_templates/quizInstructions";
import client from "./api";

const swalError = (message) => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    footer: "Please try again.",
  });
};

const QuizPage = () => {
  // const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [page, setPage] = useState(0);
  // const [previous, showPrevious] = useState(false);
  const showPrevious = false;
  // const [showScore, setShowScore] = useState(false);
  const [quiz, setQuiz] = useState(bubbleQ);

  const [algorithmId, setAlgorithmId] = useState(1);
  const [userId, setUserId] = useState(null);

  const shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  };

  useEffect(() => {
    // load selected options from local storage if available
    const selectedOptions = localStorage.getItem("selectedOptions");
    const shuffledQuiz = localStorage.getItem("shuffledQuiz");
    const currentPage = localStorage.getItem("currentQuizPage");
    let algorithmId = localStorage.getItem("algorithmId");
    algorithmId = dbIdToAlgorithmId[algorithmId];
    setAlgorithmId(algorithmId);
    setUserId(localStorage.getItem("userId"));
    if (shuffledQuiz) {
      setQuiz(JSON.parse(shuffledQuiz));
    } else {
      if (algorithmId === 1) {
        for (let i in bubbleQ) {
          bubbleQ[i] = shuffle(bubbleQ[i]);
        }
        setQuiz(bubbleQ);
        localStorage.setItem("shuffledQuiz", JSON.stringify(bubbleQ));
      }

      // let tempQuiz = shuffle(impQ);
      // setQuiz(tempQuiz);
    }
    if (currentPage) {
      setPage(parseInt(currentPage));
    }
    if (selectedOptions) {
      setSelectedOptions(JSON.parse(selectedOptions));
    }
  }, []);

  const handleAnswerOption = (currentQuestionId, answer) => {
    if (selectedOptions[currentQuestionId]?.answerByUser === answer)
      selectedOptions[currentQuestionId] = {};
    else selectedOptions[currentQuestionId] = { answerByUser: answer };
    setSelectedOptions({ ...selectedOptions });
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
    // console.log(selectedOptions);
  };

  const handleMultipleAnswerOption = (currentQuestionId, answer) => {
    // Initialize the array if it is not initialized
    if (!selectedOptions[currentQuestionId]) {
      selectedOptions[currentQuestionId] = { answerByUser: [] };
      setSelectedOptions({ ...selectedOptions });
      // console.log(selectedOptions[currentQuestionId]);
    }
    if (selectedOptions[currentQuestionId]?.answerByUser.includes(answer)) {
      selectedOptions[currentQuestionId]?.answerByUser.splice(
        selectedOptions[currentQuestionId]?.answerByUser.indexOf(answer),
        1
      );
    } else {
      selectedOptions[currentQuestionId]?.answerByUser.push(answer);
    }
    setSelectedOptions({ ...selectedOptions });
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
    // console.log(selectedOptions);
  };

  // const handlePrevious = () => {
  //   const prevQues = currentQuestion - 1;
  //   prevQues >= 0 && setCurrentQuestion(prevQues);
  // };

  const handleNextButton = () => {
    Swal.fire({
      title: "Are you sure you want to go to next page?",
      text: "You would not be able to go back!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Next Page",
      backdrop: true,
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        setPage(page + 1);
        localStorage.setItem("currentQuizPage", page + 1);
      }
    });
  };

  const handleSubmitButton = () => {
    Swal.fire({
      title: "Are you sure you want to submit?",
      text: "You would not be able to go back!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Submit Answers",
      backdrop: true,
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        // console.log("Submit Button Clicked");
        // console.log(JSON.stringify(selectedOptions));
        let newScore = 0;
        for (let j in quiz) {
          for (let i = 0; i < quiz[j].length; i++) {
            if (quiz[j][i].type === "single") {
              if (
                selectedOptions[quiz[j][i].qid]?.answerByUser ===
                quiz[j][i].correctAnswer
              ) {
                newScore += quiz[j][i].score;
              } else if (selectedOptions[quiz[j][i].qid]?.answerByUser) {
                newScore -= quiz[j][i].negScore;
              }
            } else {
              // console.log(quiz[j][i].qid);
              // For each answer in the correct answers, check if it is in the selected options
              for (let answer in selectedOptions[quiz[j][i].qid]
                ?.answerByUser) {
                if (
                  quiz[j][i].correctAnswers.includes(
                    selectedOptions[quiz[j][i].qid]?.answerByUser[answer]
                  )
                ) {
                  newScore += quiz[j][i].score;
                } else {
                  newScore -= quiz[j][i].negScore;
                }
              }
            }
          }
        }
        console.log(selectedOptions);
        console.log(newScore);

        client
          .post(
            "/submitQuiz",
            JSON.stringify({
              id: userId,
              score: newScore,
              responses: selectedOptions,
            })
          )
          .then((response) => {
            // console.log(newScore);
            //Redirect to next page

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
          })
          .catch((error) => {
            swalError(error);
          });

        // setShowScore(true);
      }
    });
  };

  // Create a list of questions render below each other
  const questions = quiz[page].map((qObj, index_q) => {
    return (
      <div key={"qq" + qObj.qid}>
        <div className="flex flex-col items-start w-full">
          <h4 className="mt-10 text-xl text-white/60">
            Question {index_q + 1} of {quiz[page].length}
          </h4>
          <div className="mt-4 text-2xl text-white">
            <div dangerouslySetInnerHTML={{ __html: qObj.question }} />
            {/* {qObj.question} */}
          </div>
        </div>
        <div className="flex flex-col w-full">
          {qObj.type === "single"
            ? qObj.answers.map((answer, index) => (
                <div
                  key={"q" + qObj.qid + index}
                  className="flex items-center w-full py-4 pl-5 m-2 ml-0 space-x-2 border-2 cursor-pointer border-white/10 rounded-xl bg-white/5"
                  onClick={(e) => handleAnswerOption(qObj.qid, answer)}
                >
                  {/* {console.log(
                    qObj.qid,
                    selectedOptions[qObj.qid]?.answerByUser,
                    answer
                  )} */}
                  <input
                    key={"a" + qObj.qid + index}
                    type="radio"
                    name={qObj.qid + answer}
                    value={answer}
                    checked={answer === selectedOptions[qObj.qid]?.answerByUser}
                    onChange={(e) => handleAnswerOption(qObj.qid, answer)}
                    onClick={(e) => handleAnswerOption(qObj.qid, answer)}
                    className="w-6 h-6 bg-black"
                  />
                  <div className="ml-6 text-white">
                    <div dangerouslySetInnerHTML={{ __html: answer }} />
                  </div>
                </div>
              ))
            : qObj.answers.map((answer, index) => (
                <div
                  key={"q" + index}
                  className="flex items-center w-full py-4 pl-5 m-2 ml-0 space-x-2 border-2 cursor-pointer border-white/10 rounded-xl bg-white/5"
                  onClick={(e) => handleMultipleAnswerOption(qObj.qid, answer)}
                >
                  <input
                    key={"a" + { index }}
                    type="checkbox"
                    name={qObj.qid + answer}
                    value={answer}
                    checked={
                      selectedOptions[qObj.qid]?.answerByUser.includes(
                        answer
                      ) || false
                    }
                    onChange={(e) =>
                      handleMultipleAnswerOption(qObj.qid, answer)
                    }
                    onClick={(e) =>
                      handleMultipleAnswerOption(qObj.qid, answer)
                    }
                    className="w-6 h-6 bg-black"
                  />
                  <div className="ml-6 text-white">
                    <div dangerouslySetInnerHTML={{ __html: answer }} />
                  </div>
                </div>
              ))}
        </div>
      </div>
    );
  });

  return (
    // add scroll verticaly to the page
    <div className="flex flex-col w-screen px-5 h-screen bg-[#1A1A1A] overflow-y-auto">
      <h1 className="text-3xl text-white item-start w-full text-center">
        Quiz
      </h1>
      {/* Display page number */}
      <div className="flex flex-col items-center w-full">
        <h4 className="mt-10 text-xl text-white/60">
          Page {page + 1} of {Object.keys(quiz).length}
        </h4>
      </div>
      <div className="text-white text-2xl">
        <ol className="list-inside list-decimal">
          {quizInstructions[algorithmId].map((l, i) => {
            return <li key={i}>{l}</li>;
          })}
        </ol>
      </div>
      {/* {showScore ? (
        <h1 className="text-3xl font-semibold text-center text-white">
          You scored {score}
        </h1>
      ) : ( */}
      <>
        {questions}
        <div className="flex justify-between w-full mt-4 text-white">
          {page > 0 && showPrevious ? (
            <button
              className="w-[49%] py-3 bg-indigo-600 rounded-lg margin"
              onClick={(e) => setPage(page - 1)}
            >
              Previous
            </button>
          ) : (
            <></>
          )}

          <button
            onClick={
              page === Object.keys(quiz).length - 1
                ? handleSubmitButton
                : handleNextButton
            }
            className="w-[49%] py-3 bg-indigo-600 rounded-lg margin"
          >
            {page === Object.keys(quiz).length - 1 ? "Submit Answers" : "Next Page"}
          </button>
        </div>
        <br />
      </>
      {/* )} */}
    </div>
  );
};

export default QuizPage;
