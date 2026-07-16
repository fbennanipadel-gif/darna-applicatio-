import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
  firstName:{type:String,required:true,trim:true,maxlength:50}, lastName:{type:String,required:true,trim:true,maxlength:50},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true}, phone:{type:String,trim:true},
  password:{type:String,required:true,minlength:8,select:false}, role:{type:String,enum:['user','partner','admin'],default:'user',index:true},
  language:{type:String,enum:['en','fr','ar','es'],default:'en'}, favorites:[{type:mongoose.Schema.Types.ObjectId,ref:'Restaurant'}],
  refreshTokens:[{token:String,createdAt:{type:Date,default:Date.now}}], isActive:{type:Boolean,default:true}
},{timestamps:true});
userSchema.pre('save', async function(){ if(this.isModified('password')) this.password=await bcrypt.hash(this.password,12); });
userSchema.methods.comparePassword=function(candidate){return bcrypt.compare(candidate,this.password)};
export default mongoose.model('User',userSchema);
