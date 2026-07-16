import mongoose from 'mongoose';
const hoursSchema=new mongoose.Schema({day:String,open:String,close:String,closed:{type:Boolean,default:false}},{_id:false});
const restaurantSchema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,index:'text'}, slug:{type:String,unique:true,index:true}, shortDescription:{type:String,maxlength:180}, description:String,
  categories:[{type:String,index:true}], city:{type:String,required:true,index:true}, address:String, location:{type:{type:String,enum:['Point'],default:'Point'},coordinates:{type:[Number],default:[-7.5898,33.5731]}},
  logo:String, images:[String], rating:{type:Number,default:0,min:0,max:5}, reviewCount:{type:Number,default:0}, priceLevel:{type:Number,default:2,min:1,max:4},
  phone:String, website:String, social:{instagram:String,facebook:String}, openingHours:[hoursSchema], owner:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, verified:{type:Boolean,default:false}, promoted:{type:Boolean,default:false}, nfcPublicId:{type:String,unique:true,sparse:true}
},{timestamps:true});
restaurantSchema.index({location:'2dsphere'}); restaurantSchema.index({name:'text',shortDescription:'text',categories:'text'});
restaurantSchema.pre('validate',function(){if(!this.slug&&this.name)this.slug=this.name.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');});
export default mongoose.model('Restaurant',restaurantSchema);
