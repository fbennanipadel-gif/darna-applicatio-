import mongoose from 'mongoose';
export default mongoose.model('Offer',new mongoose.Schema({restaurant:{type:mongoose.Schema.Types.ObjectId,ref:'Restaurant',required:true},title:{type:String,required:true},description:String,discount:String,expiresAt:Date,active:{type:Boolean,default:true}},{timestamps:true}));
