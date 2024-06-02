const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 9000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/quiz-db', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB Connection Error: ', err));

// Define the Question schema and model
const QuestionSchema = new mongoose.Schema({
 SL: String,
 Category: String,
 Question: String,
 OptionA: String,
 OptionB: String,
 OptionC: String,
 OptionD: String,
 Answer: String,
 Reference: String,
 Application: String,
});

const Question = mongoose.model('Question', QuestionSchema);

app.get('/get-questions', async (req, res) => {
 try {
   const questions = await Question.find();
   res.status(200).json({ questions });
 } catch (err) {
   res.status(500).json({ message: 'Failed to fetch questions' });
 }
});

app.post('/save-questions', async (req, res) => {
 try {
   const questions = req.body.questions;
   await Question.deleteMany({}); // delete existing questions first, if necessary
   await Question.insertMany(questions);
   res.status(200).json({ message: 'Questions saved successfully' });
 } catch (err) {
   res.status(500).json({ message: 'Failed to save questions' });
 }
});

app.delete('/delete-question/:sl', async (req, res) => {
 const sl = req.params.sl;
 try {
   await Question.deleteOne({ SL: sl });
   res.status(200).json({ message: 'Question deleted successfully' });
 } catch (err) {
   res.status(500).json({ message: 'Failed to delete question' });
 }
});

app.delete('/delete-questions', async (req, res) => {
 try {
   await Question.deleteMany({});
   res.status(200).json({ message: 'All questions deleted successfully' });
 } catch (err) {
   res.status(500).json({ message: 'Failed to delete questions' });
 }
});

app.listen(port, () => {
 console.log(`Server running on port ${port}`);
});