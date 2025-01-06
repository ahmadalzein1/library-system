let mongoose=require("mongoose");
let bookSchema= new mongoose.Schema({
    title: {type:{
        en: { type: String,required:true,trim:true},  // First required field
        ar: { type: String,required:true,trim:true} , // Second required field
        _id:false,
      },required:true},
     isbn: {type:String ,unique:true ,required:true,trim:true},
     genre: {type:String,required:true,trim:true},
     description: {type:{
        en: { type: String,required:true,trim:true},  // First required field
        ar: { type: String,required:true,trim:true} , // Second required field
        _id:false,
      },required:true},
      numberOfAvailableCopies: {type:Number,default:5},
      isOpenToReviews:{type:Boolean,default:true},
      publishedDate: {type:Date,default:null},
      isPublished:{type:Boolean,default:false},
      authorId:{type:mongoose.Types.ObjectId,required:true,trim:true,ref:'Author'},
      isBorrowable:{type:Boolean,required:true},
      numberOfBorrowableDays:{type:Number,required:true},
      minAge: {type:Number,required:true},// minimum required age to borrow a book
      coverImageUrl:{ type: String,trim:true}
},{timestamps:true});
module.exports=mongoose.model("Book",bookSchema)


 
     