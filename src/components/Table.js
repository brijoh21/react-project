import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import CustomModal from './CustomModal';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'sweetalert2/dist/sweetalert2.min.css';

const Table = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayItems, setDisplayItems] = useState(20);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataSaved, setDataSaved] = useState(true);

  // Fetch questions from the backend
  const fetchQuestions = () => {
    axios.get('http://localhost:9000/get-questions')
      .then(response => {
        const fetchedQuestions = response.data.questions.map((q, idx) => ({
          SL: String(idx + 1),
          Category: q.Category || '',
          Question: q.Question || '',
          OptionA: q.OptionA || '',
          OptionB: q.OptionB || '',
          OptionC: q.OptionC || '',
          OptionD: q.OptionD || '',
          Answer: q.Answer || '',
          Reference: q.Reference || '',
          Application: q.Application || '',
        }));
        setQuestions(fetchedQuestions);
        setFilteredQuestions(fetchedQuestions.slice(0, displayItems === 'All' ? fetchedQuestions.length : displayItems));
        setDataLoaded(true);
      })
      .catch(error => console.error("Error loading data!", error));
  };

  useEffect(() => {
    fetchQuestions();
  }, [displayItems]);

  useEffect(() => {
    if (dataLoaded) {
      const uniqueCategories = ['All', ...new Set(questions.map(q => q.Category || ''))];
      setCategories(uniqueCategories);
    }
  }, [questions, dataLoaded]);

  useEffect(() => {
    filterQuestions();
  }, [selectedCategory, questions, displayItems]);

  const parseCSV = (data) => {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(header => header.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(',').map(val => val.trim());
      const question = {};
      headers.forEach((header, index) => {
        question[header] = values[index] ? values[index].replace(/(^"|"$)/g, '') : '';
      });
      return question;
    });
  };

  const handleFileUpload = (data) => {
    const parsedData = parseCSV(data).map((q, index) => ({
      SL: String(questions.length + index + 1), // Generate SL dynamically
      Category: q['Category'] || '',
      Question: q['Question'] || '',
      OptionA: q['Option A'] || '',
      OptionB: q['Option B'] || '',
      OptionC: q['Option C'] || '',
      OptionD: q['Option D'] || '',
      Answer: q['Answer'] || '',
      Reference: q['Reference'] || '',
      Application: q['Application'] || '',
    }));

    if (parsedData.length > 0) {
      setQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions, ...parsedData];
        const reassignedQuestions = newQuestions.map((q, idx) => ({ ...q, SL: String(idx + 1) }));
        setFilteredQuestions(reassignedQuestions.slice(0, displayItems === 'All' ? reassignedQuestions.length : displayItems));
        setDataSaved(false); // Making sure save data button is visible
        return reassignedQuestions;
      });
    } else {
      Swal.fire({ title: "Error", text: "No valid data found in the file.", icon: "error" });
    }
  };

  const filterQuestions = () => {
    if (!Array.isArray(questions) || questions.length === 0) return;
    let filtered = questions;
    if (selectedCategory !== 'All') {
      filtered = questions.filter(q => q.Category === selectedCategory);
    }
    setFilteredQuestions(filtered.slice(0, displayItems === 'All' ? filtered.length : displayItems));
  };

  const openModal = (question, edit = false) => {
    setSelectedQuestion(question);
    setIsEditing(edit);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedQuestion(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedQuestions = questions.map(question =>
          question.SL === selectedQuestion.SL ? selectedQuestion : question
        );
        setQuestions(updatedQuestions);
        filterQuestions();
        closeModal();
        setDataSaved(false);  // Making sure save data button is visible
        Swal.fire({ title: "Saved!", text: "Your changes have been saved.", icon: "success" });
      }
    });
  };

  const handleDelete = (sl) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:9000/delete-question/${sl}`)
          .then(() => {
            setQuestions(prevQuestions => {
              const updatedQuestions = prevQuestions.filter(question => question.SL !== sl);
              const reorderedQuestions = updatedQuestions.map((q, idx) => ({
                ...q,
                SL: String(idx + 1)
              }));
              setFilteredQuestions(reorderedQuestions.slice(0, displayItems === 'All' ? reorderedQuestions.length : displayItems));
              Swal.fire({ title: "Deleted!", text: "Your file has been deleted.", icon: "success" });
              return reorderedQuestions;
            });
          })
          .catch(() => {
            Swal.fire("Error", "Failed to delete data!", "error");
          });
      }
    });
  };

  const handleDeleteAll = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete all data!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete('http://localhost:9000/delete-questions')
          .then(() => {
            setQuestions([]);
            setFilteredQuestions([]);
            setDataSaved(true); // Hiding save data button
            Swal.fire({ title: "Deleted!", text: "All data has been deleted.", icon: "success" });
          })
          .catch(() => {
            Swal.fire("Error", "Failed to delete data!", "error");
          });
      }
    });
  };

  const truncateText = (text = '') => text.split(' ').slice(0, 2).join(' ') + (text.split(' ').length > 2 ? '...' : '');

  const handleSaveData = () => {
    axios.post('http://localhost:9000/save-questions', { questions })
      .then(response => {
        Swal.fire({ title: "Success", text: "Data saved successfully!", icon: "success" });
        setDataSaved(true);  // Hide save data button
        fetchQuestions(); // Fetch updated data from backend after saving
      })
      .catch(error => {
        Swal.fire({ title: "Error", text: "Failed to save data!", icon: "error" });
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bible Quiz Questions (Total Questions: {questions.length})</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <label className="mr-2" htmlFor="categoryFilter">Filter by Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} id="categoryFilter" className="py-2 px-4 border rounded">
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="mr-4">
          <label className="mr-2" htmlFor="showItems">Show:</label>
          <select value={displayItems} onChange={(e) => setDisplayItems(e.target.value)} id="showItems" className="py-2 px-4 border rounded">
            {['20', '50', '100', 'All'].map((num, index) => (
              <option key={index} value={num}>{num}</option>
            ))}
          </select>
        </div>
        {questions.length > 0 && (
          <>
            {!dataSaved && (
              <button onClick={handleSaveData} className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2">
                Save Data
              </button>
            )}
            <button onClick={handleDeleteAll} className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700">
              Delete All Data
            </button>
          </>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white border border-gray-200 text-sm">
          <thead className="bg-blue-200">
            <tr className="text-left">
              {['', 'SL', 'Category', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Answer', 'Reference', 'Application', 'Action'].map((heading, index) => (
                <th key={index} className="py-2 px-2 border border-gray-300">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((question, index) => (
              question && question.SL && question.Category && question.Question && (
                <tr key={index} className="text-left hover:bg-gray-100">
                  <td className="py-1 px-2 border border-gray-300"><input type="checkbox" /></td>
                  <td className="py-1 px-2 border border-gray-300">{question.SL}</td>
                  <td className="py-1 px-2 border border-gray-300">{question.Category}</td>
                  <td className="py-1 px-2 border border-gray-300">{truncateText(question.Question)}</td>
                  <td className="py-1 px-2 border border-gray-300">{truncateText(question.OptionA)}</td>
                  <td className="py-1 px-2 border border-gray-300">{truncateText(question.OptionB)}</td>
                  <td className="py-1 px-2 border border-gray-300">{truncateText(question.OptionC)}</td>
                  <td className="py-1 px-2 border border-gray-300">{truncateText(question.OptionD)}</td>
                  <td className="py-1 px-2 border border-gray-300">{truncateText(question.Answer)}</td>
                  <td className="py-1 px-2 border border-gray-300">{truncateText(question.Reference)}</td>
                  <td className="py-1 px-2 border border-gray-300">{truncateText(question.Application)}</td>
                  <td className="py-1 px-2 border border-gray-300">
                    <div className="flex justify-center space-x-2">
                      <FontAwesomeIcon icon={faEye} className="cursor-pointer text-blue-500 hover:bg-gray-200 rounded-full p-1" onClick={() => openModal(question)} />
                      <FontAwesomeIcon icon={faEdit} className="cursor-pointer text-green-500 hover:bg-gray-200 rounded-full p-1" onClick={() => openModal(question, true)} />
                      <FontAwesomeIcon icon={faTrashAlt} className="cursor-pointer text-red-500 hover:bg-gray-200 rounded-full p-1" onClick={() => handleDelete(question.SL)} />
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
      {selectedQuestion && (
        <CustomModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          question={selectedQuestion}
          isEditing={isEditing}
          categories={categories.filter(cat => cat !== 'All')}
          handleInputChange={(e) => setSelectedQuestion(prevState => ({ ...prevState, [e.target.name]: e.target.value }))}
          handleSave={handleSave}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default Table;