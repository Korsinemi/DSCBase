import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  Guild: String,
  Message: String,
  Channel: String,
});

export default mongoose.model('levelmessage', Schema);
