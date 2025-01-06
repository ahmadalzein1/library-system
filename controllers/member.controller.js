const Member=require("../models/Member");
const Book=require("../models/Book");
const Author=require("../models/Author");
const mongoose=require("mongoose")
const asynchandler=require("express-async-handler");
const { validateCreateMember,validateUpdateMember } = require("../validations/member.validation");
const sendEmail = require("../service/nodemailer.service");
const createMember=asynchandler(async(req,res)=>{
    let {error}=validateCreateMember(req.body);
    if(error) return res.status(400).json(error);
let member= new Member({
    name:req.body.name,
email:req.body.email,
username:req.body.username,
subscribedBooks:req.body.subscribedBooks,
returnRate:req.body.returnRate,
borrowedBooks:req.body.borrowedBooks,
birthDate:req.body.birthDate
});
await member.save();
res.json(member);
console.log(member)
});
const getMembers=asynchandler(async(req,res)=>{
    let { name, username,email,limit=3,pageNumber=1 }=req.query;
    let query={};
    if(name) query.name=name;
    if(username) query.username=username;
    if(email) query.email=email;
    let members=await Member.find(query).sort({returnRate:-1}).limit(limit).skip((pageNumber-1)*limit);
    members=members.map(member=>{let {borrowedBooks,...newMember}=member._doc;newMember.nbOfBorrowedBooks=borrowedBooks.length;return newMember;})
    res.json(members);
});
const getMemberById=asynchandler(async(req,res)=>{

let member=await Member.findById(req.params.id);
if(!member) return res.status(404).json({message:"member not found"});
res.json(member);
});
const deleteMemberById=asynchandler(async(req,res)=>{
    let member=await Member.findById(req.params.id);
    if(!member) return res.status(404).json({message:"member not found"});
    await Member.findByIdAndDelete(req.params.id);
    res.json({message:"member has been deleted"})
    
});
const updateMemberById=asynchandler(async(req,res)=>{


    const{error}=validateUpdateMember(req.body);
    if(error) return res.status(400).json(error);
    
    const member=await Member.findByIdAndUpdate(req.params.id,{$set:{
        name:req.body.name,
        email:req.body.email,
        username:req.body.username,
        subscribedBooks:req.body.subscribedBooks,
        returnRate:req.body.returnRate,
        borrowedBooks:req.body.borrowedBooks,
        birthDate:req.body.birthDate
    
    }},{new:true})
    if(!member) return res.status(404).json({message:"member not found"})
    res.json(member);


    
});
function getAge(birthDate){
    let diffOnMilli=Date.now()-birthDate.getTime();
    return Math.ceil(diffOnMilli/1000/60/60/24/30/12);
}
const borrowsBook=asynchandler(async(req,res)=>{
    let member=req.member;
    let book=await Book.findById(req.params.id);
    if(!book) return res.status(404).json({message:"book not found"})
   let borrowedBook=member.borrowedBooks.find(b=>b.borrowedBookId.equals(book._id))
if(borrowedBook) return res.status(400).json({message:"u already borrowed this book and u didnt return it yet,u cant borrow it twice"})
 if(member.returnRate<30) return res.status(403).json({message:'your return rate is bellow 30%'}) ;
if(getAge(member.birthDate)>book.minAge) return res.status(403).json({message:'your age  is above the min age'}) ;
if(book.numberOfAvailableCopies===0) return res.status(403).json({message:'theres no left copies of this book to borrow'}) ;
book.numberOfAvailableCopies--;
  member.borrowedBooks.push({
    borrowedBookId:book._id,
    borrowedDate:new Date(),
    returnDate:new Date( Date.now()+book.numberOfBorrowableDays*24*60*60*1000)
});
await member.save();
await book.save();
const author=await Author.findById(book.authorId);
sendEmail(author.email,'new Borrowed Book! ',`<h1>a member borrowed a copy of  your book${book.title.en}</h1>`);
res.json({message:"book is borrowed successfully"});

});
const returnsBook=asynchandler(async(req,res)=>{
    let member=req.member;
    let book=await Book.findById(req.params.id);
    if(!book) return res.status(404).json({message:"book not found"});
    let borrowedBook=member.borrowedBooks.find((eachBorrowedBook)=>eachBorrowedBook.borrowedBookId.equals(book._id));
    if(!borrowedBook) return  res.status(404).json({message:"book not borrowed by you indeed!"});




     const now = new Date();
     const isOnTime = now <= borrowedBook.returnDate;
   
     // Update return rate
     const totalBooks = member.borrowedBooks.length;
     const onTimeBooks = member.returnRate * totalBooks / 100 + (isOnTime ? 1 : -0.5);
     member.returnRate = (onTimeBooks / totalBooks) * 100;
       
     member.borrowedBooks=member.borrowedBooks.filter((eachBorrowedBook)=>!eachBorrowedBook.borrowedBookId.equals(book._id))
     book.numberOfAvailableCopies++;


     await book.save();
     await member.save();
     res.json({message:'book returned successfully'})
})
const getBorrowedBooksOfMember=asynchandler(async(req,res)=>{
    let member=req.member;
    let now=Date.now();
let borrowedBooks=member.borrowedBooks.map((eachBorrowedBook)=>{

let daysLeft=(eachBorrowedBook.returnDate.getTime()-now)/1000/60/60/24;
    return {
        borrowedBookId:eachBorrowedBook.borrowedBookId,
        daysLeft,
        warning:daysLeft<0.5,
        expired:daysLeft<0
    };
});
borrowedBooks.sort((a, b) => a.daysLeft - b.daysLeft);
  res.json(borrowedBooks);
})

const subsBook=asynchandler(async(req,res)=>{
let member=req.member;
let book= await Book.findById(req.params.id);
if(!book) return res.status(404).json({message:"book not found"});
if(member.subscribedBooks.includes(book._id)) return res.status(401).json({message:"u already subscribed to this book!"});
member.subscribedBooks.push(book._id);
await member.save();
res.json({message:"subs to the book  was successfully done"});
});
const unsubsBook=asynchandler(async(req,res)=>{

    let member=req.member;
    let book= await Book.findById(req.params.id);
    if(!book) return res.status(404).json({message:"book not found"});
    if(!member.subscribedBooks.includes(book._id)) return res.status(401).json({message:"u're not subscribed to this book indeed!"});
    member.subscribedBooks=member.subscribedBooks.filter((eachSubsBookId)=>!eachSubsBookId.equals(book._id));
    await member.save();
    res.json({message:"unsubs to the book  was successfully done"});
});
module.exports={subsBook,unsubsBook,getBorrowedBooksOfMember,returnsBook,borrowsBook,createMember,getMembers,updateMemberById,deleteMemberById,getMemberById}