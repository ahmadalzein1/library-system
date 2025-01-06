let mongoose=require("mongoose");
let memberSchema= new mongoose.Schema({
     name: {type:String,required:true,trim:true},
     email: {type:String,required:true,unique:true,trim:true},
     username: {type:String,required:true,unique:true,trim:true},
     subscribedBooks: {type:[{type:mongoose.Types.ObjectId,trim:true,ref:"Book"}],default:[]},
     returnRate: {type:Number,default:100},
     borrowedBooks:{type:[{
         borrowedBookId: {type:mongoose.Types.ObjectId,ref:"Book"},
         borrowedDate: Date,
         returnDate: Date,
         _id:false
       }],default:[]},
    birthDate: {type:Date,required:true,trim:true},
  


},{timestamps:true});
module.exports=mongoose.model("Member",memberSchema)


 
     