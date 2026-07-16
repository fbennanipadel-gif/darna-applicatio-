import mongoose from 'mongoose';
const itemSchema=new mongoose.Schema({name:{type:String,required:true,maxlength:120},nameAr:String,description:{type:String,maxlength:500},price:{type:Number,required:true,min:0},photo:String,allergens:[String],recommended:{type:Boolean,default:false},available:{type:Boolean,default:true},sortOrder:{type:Number,default:0}},{timestamps:true});
const categorySchema=new mongoose.Schema({name:{type:String,required:true,maxlength:80},nameAr:String,sortOrder:{type:Number,default:0},items:[itemSchema]},{_id:true});
export default mongoose.model('Menu',new mongoose.Schema({restaurant:{type:mongoose.Schema.Types.ObjectId,ref:'Restaurant',required:true,unique:true,index:true},categories:[categorySchema]},{timestamps:true}));
