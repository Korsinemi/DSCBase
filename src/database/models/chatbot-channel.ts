import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  Guild: String,
  Channel: String,
});

export default mongoose.model('chatbot', Schema);
