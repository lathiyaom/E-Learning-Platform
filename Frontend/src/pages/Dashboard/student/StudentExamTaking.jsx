import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetExamByIdQuery, useSubmitExamMutation } from "../../../redux/Apis/examApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../redux/slice/authSlice";
import AdminLayout from "../../../utils/Adminlayoute";
import { Clock, Send } from "lucide-react";

const StudentExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: examData, isLoading } = useGetExamByIdQuery(examId);
  const [submitExam, { isLoading: submitting }] = useSubmitExamMutation();

  const exam = examData?.data;

  useEffect(() => {
    if (exam?.duration) {
      setTimeLeft(exam.duration * 60); // duration in minutes
    }
  }, [exam]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && exam) {
      handleSubmit();
    }
  }, [timeLeft, exam]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    try {
      await submitExam({ examId, answers }).unwrap();
      navigate("/student/exam-results");
    } catch (error) {
      console.error("Failed to submit exam:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Loading exam...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!exam) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Exam not found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <div className="flex items-center text-red-600">
              <Clock className="mr-2" size={20} />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <p className="text-gray-600 mb-4">{exam.description}</p>
          <p className="text-sm text-gray-500">Total Marks: {exam.totalMarks}</p>
        </div>

        <div className="space-y-6">
          {exam.questions?.map((question, index) => (
            <div key={question._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Question {index + 1}: {question.question}
              </h3>
              <p className="text-sm text-gray-600 mb-4">Marks: {question.marks}</p>

              {question.type === 'mcq' && (
                <div className="space-y-2">
                  {question.options?.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${question._id}`}
                        value={option}
                        checked={answers[question._id] === option}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {(question.type === 'short' || question.type === 'essay') && (
                <textarea
                  value={answers[question._id] || ''}
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  placeholder={`Enter your ${question.type} answer...`}
                  className="w-full p-3 border rounded-lg"
                  rows={question.type === 'essay' ? 6 : 3}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center mx-auto"
          >
            <Send className="mr-2" size={20} />
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentExamTaking;