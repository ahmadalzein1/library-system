let mongoose=require("mongoose");
let authorSchema= new mongoose.Schema({
     name: {type:{
        en: { type: String,required:true,trim:true},  // First required field
        ar: { type: String,required:true,trim:true} , // Second required field
        _id:false,
      },required:true},
     email: {type:String,required:true,unique:true,trim:true},
     biography: {type:new mongoose.Schema({
        en: { type: String,required:true,trim:true},  // First required field
        ar: { type: String,required:true,trim:true} ,  // Second required field
        _id:false
      })
      ,required:true},
     profileImageUrl: {type:String,default:"https://datafoundation.iiit.ac.in/static/media/0-defaultProfile.5a46252330e6e98231f8.webp",trim:true},
    birthDate: {type:Date,required:true,trim:true},
  


},{timestamps:true});
module.exports=mongoose.model("Author",authorSchema)


 
     