import mongoose from 'mongoose';
const nfcTagSchema=new mongoose.Schema({restaurant:{type:mongoose.Schema.Types.ObjectId,ref:'Restaurant',required:true,index:true},uid:{type:String,required:true,unique:true,uppercase:true,trim:true},label:{type:String,maxlength:80},lastCounter:{type:Number,default:0,min:0},active:{type:Boolean,default:true},revokedAt:Date},{timestamps:true});
export default mongoose.model('NfcTag',nfcTagSchema);
