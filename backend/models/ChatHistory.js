import mongoose from 'mongoose';
export default mongoose.model('ChatHistory',new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},sessionId:String,messages:[{role:{type:String,enum:['user','assistant']},content:String,createdAt:{type:Date,default:Date.now}}]},{timestamps:true}));
