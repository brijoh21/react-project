import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Ensure accessibility compliance

const CustomModal = ({
  isOpen, 
  onRequestClose, 
  question, 
  isEditing, 
  categories, 
  handleInputChange, 
  handleSave, 
  closeModal 
}) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Question Details"
        className="bg-white p-4 border rounded shadow-lg max-w-lg mx-auto my-20"
    >
        <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Question" : "Question Details"}</h2>
        <div className="mb-2"><strong>SL:</strong> {question.SL}</div>
        {isEditing ? (
            <>
                <div className="mb-2">
                    <label className="block font-bold">Category:</label>
                    <select
                        name="Category"
                        value={question.Category}
                        onChange={handleInputChange}
                        className="border rounded px-2 py-1 w-full"
                    >
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                {['Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'Answer', 'Reference', 'Application'].map((field, index) => (
                    <div key={index} className="mb-2">
                        <label className="block font-bold">{field.replace(/([A-Z])/g, ' $1')}:</label>
                        <input
                            type="text"
                            name={field}
                            value={question[field]}
                            onChange={handleInputChange}
                            className="border rounded px-2 py-1 w-full"
                        />
                    </div>
                ))}
                <button
                    onClick={handleSave}
                    className="mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                    Save
                </button>
            </>
        ) : (
            <>
                {['Category', 'Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'Answer', 'Reference', 'Application'].map((field, index) => (
                    <div key={index} className="mb-2"><strong>{field.replace(/([A-Z])/g, ' $1')}:</strong> {question[field]}</div>
                ))}
            </>
        )}
        <button
            onClick={closeModal}
            className="mt-4 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700"
        >
            Close
        </button>
    </Modal>
);

export default CustomModal;