import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import ReactPaginate from 'react-paginate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

Modal.setAppElement('#root');

const Table = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const uniqueCategories = ['All', ...new Set(questions.map(q => q['Category']))];
    setCategories(uniqueCategories);
  }, [questions]);

  useEffect(() => {
    filterQuestions();
  }, [selectedCategory, questions, currentPage]);

  const parseCSV = (data) => {
    const lines = data.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const question = {};
      headers.forEach((header, index) => {
        question[header] = values[index] ? values[index].trim() : '';
      });
      return question;
    });
  };

  const handleFileUpload = (data) => {
    const parsedData = parseCSV(data);
    setQuestions(parsedData);
    setFilteredQuestions(parsedData);
    setCurrentPage(0);
  };

  const filterQuestions = () => {
    if (selectedCategory === 'All') {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(q => q['Category'] === selectedCategory);
      setFilteredQuestions(filtered);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(0);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedQuestion(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSave = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedQuestions = questions.map(question =>
          question['SL'] === selectedQuestion['SL'] ? selectedQuestion : question
        );
        setQuestions(updatedQuestions);
        filterQuestions();
        closeModal();
        Swal.fire({
          title: "Saved!",
          text: "Your changes have been saved.",
          icon: "success"
        });
      }
    });
  };

  const handleDelete = (sl) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedQuestions = questions.filter(question => question['SL'] !== sl);
        setQuestions(updatedQuestions);
        filterQuestions();
        swalWithBootstrapButtons.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your imaginary file is safe :)",
          icon: "error"
        });
      }
    });
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredQuestions.slice(offset, offset + itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bible Quiz Questions</h1>
      <FileUpload onFileUpload={handleFileUpload} />
      <div className="mb-4">
        <label className="mr-2">Filter by Category:</label>
        <select value={selectedCategory} onChange={handleCategoryChange} className="py-2 px-4 border rounded">
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-r"><input type="checkbox" /></th>
              <th className="py-2 px-4 border-b border-r">SL</th>
              <th className="py-2 px-4 border-b border-r">Category</th>
              <th className="py-2 px-4 border-b border-r">Question</th>
              <th className="py-2 px-4 border-b border-r">Option A</th>
              <th className="py-2 px-4 border-b border-r">Option B</th>
              <th className="py-2 px-4 border-b border-r">Option C</th>
              <th className="py-2 px-4 border-b border-r">Option D</th>
              <th className="py-2 px-4 border-b border-r">Answer</th>
              <th className="py-2 px-4 border-b border-r">Reference</th>
              <th className="py-2 px-4 border-b border-r">Application</th>
              <th className="py-2 px-4 border-b border-r">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((question, index) => (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="py-2 px-4 border-b border-r"><input type="checkbox" /></td>
                <td className="py-2 px-4 border-b border-r">{question['SL']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Category']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Question']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Option A']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Option B']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Option C']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Option D']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Answer']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Reference']}</td>
                <td className="py-2 px-4 border-b border-r">{question['Application']}</td>
                <td className="py-2 px-4 border-b border-r">
                  {question['Category'] && (
                    <>
                      <FontAwesomeIcon icon={faEye} className="mx-2 cursor-pointer text-blue-500" onClick={() => openModal(question)} />
                      <FontAwesomeIcon icon={faEdit} className="mx-2 cursor-pointer text-green-500" onClick={() => openModal(question, true)} />
                      <FontAwesomeIcon icon={faTrashAlt} className="mx-2 cursor-pointer                       text-red-500" onClick={() => handleDelete(question['SL'])} />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={Math.ceil(filteredQuestions.length / itemsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
        />
      </div> 

      {selectedQuestion && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Question Details"
          className="bg-white p-4 border rounded shadow-lg max-w-lg mx-auto my-20"
        >
          <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Question" : "Question Details"}</h2>
          <div className="mb-2"><strong>SL:</strong> {selectedQuestion['SL']}</div>
          {isEditing ? (
            <>
              <div className="mb-2">
                <label className="block font-bold">Category:</label>
                <input
                  type="text"
                  name="Category"
                  value={selectedQuestion['Category']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Question:</label>
                <input
                  type="text"
                  name="Question"
                  value={selectedQuestion['Question']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Option A:</label>
                <input
                  type="text"
                  name="Option A"
                  value={selectedQuestion['Option A']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Option B:</label>
                <input
                  type="text"
                  name="Option B"
                  value={selectedQuestion['Option B']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Option C:</label>
                <input
                  type="text"
                  name="Option C"
                  value={selectedQuestion['Option C']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Option D:</label>
                <input
                  type="text"
                  name="Option D"
                  value={selectedQuestion['Option D']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Answer:</label>
                <input
                  type="text"
                  name="Answer"
                  value={selectedQuestion['Answer']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Reference:</label>
                <input
                  type="text"
                  name="Reference"
                  value={selectedQuestion['Reference']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <div className="mb-2">
                <label className="block font-bold">Application:</label>
                <input
                  type="text"
                  name="Application"
                  value={selectedQuestion['Application']}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
              <button
                onClick={handleSave}
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <div className="mb-2"><strong>Category:</strong> {selectedQuestion['Category']}</div>
              <div className="mb-2"><strong>Question:</strong> {selectedQuestion['Question']}</div>
              <div className="mb-2"><strong>Option A:</strong> {selectedQuestion['Option A']}</div>
              <div className="mb-2"><strong>Option B:</strong> {selectedQuestion['Option B']}</div>
              <div className="mb-2"><strong>Option C:</strong> {selectedQuestion['Option C']}</div>
              <div className="mb-2"><strong>Option D:</strong> {selectedQuestion['Option D']}</div>
              <div className="mb-2"><strong>Answer:</strong> {selectedQuestion['Answer']}</div>
              <div className="mb-2"><strong>Reference:</strong> {selectedQuestion['Reference']}</div>
              <div className="mb-2"><strong>Application:</strong> {selectedQuestion['Application']}</div>
            </>
          )}
          <button
            onClick={closeModal}
            className="mt-4 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </Modal>
      )}
    </div>
  );
};

export default Table;

