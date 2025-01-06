const Book=require("../models/Book");
const asynchandler=require("express-async-handler");
const sendEmail=require("../service/nodemailer.service");
const Member=require("../models/Member.js");
const axios=require("axios");
const {validateCreateBook,validateUpdateBook}=require("../validations/book.validations");

const createBook=asynchandler(async(req,res)=>{
  
   if(!req.file) return res.status(400).json({"message":"image is reqiured"})

    let openToRev,borrowable,estpublish;
    if(req.body.isOpenToReviews) openToRev=(req.body.isOpenToReviews==="true")?true:false;
if(req.body.isBorrowable)borrowable=(req.body.isBorrowable==="true")?true:false;
if(req.body.isPublished)estpublish=(req.body.isPublished==="true")?true:false;
    let {error}=validateCreateBook({
      title:JSON.parse(req.body.title??'{}'),
      isbn:req.body.isbn,
      genre:req.body.genre,
      description:JSON.parse(req.body.description??'{}'),
      numberOfAvailableCopies:+req.body.numberOfAvailableCopies,
      isOpenToReviews:openToRev,
      publishedDate:req.body.publishedDate,
      isPublished:estpublish,
      authorId:req.body.authorId,
      isBorrowable:borrowable,
      numberOfBorrowableDays:+req.body.numberOfBorrowableDays,
      minAge:+req.body.minAge,})
      if(error) return res.status(400).json({error})
let book= new Book({title:JSON.parse(req.body.title),
    isbn:req.body.isbn,
    genre:req.body.genre,
    description:JSON.parse(req.body.description),
    numberOfAvailableCopies:+req.body.numberOfAvailableCopies,
    isOpenToReviews:(req.body.isOpenToReviews==="true")?true:false,
    publishedDate:req.body.publishedDate,
    isPublished:(req.body.isPublished==="true")?true:false,
    authorId:req.body.authorId,
    isBorrowable:(req.body.isBorrowable==="true")?true:false,
    numberOfBorrowableDays:+req.body.numberOfBorrowableDays,
    minAge:+req.body.minAge,
    coverImageUrl:"localhost:8000/images/"+req.file.filename
});
await book.save();
res.json(book);
});

const getBookById=asynchandler(async(req,res)=>{
const book=await Book.findById(req.params.id).select("-updatedAt -coverImageUrl");
if(!book) return res.status(404).json({'message':"user not found"});
const {lang="en"}=req.query;
let{title,description,...others}=book._doc;
title=title[lang];
description=description[lang];
    res.json({title,description,...others});
});
const getBooks=asynchandler(async(req,res)=>{
    const { isbn,genre ,en,ar,booksPerPage=3} = req.query;
    let books;
    // Construct the query object dynamically
    const query = {};

  
    if (isbn) {
      query.isbn = isbn; // Exact match for ISBN
    }
    
    if (genre) {
      query.genre = genre; // Exact match for genre
    }
    if (en && ar) {
        const genreFilter = {};
        if (en) {
          genreFilter.en = en; // Filter by primary genre
        }
        if (ar) {
          genreFilter.ar = ar; // Filter by secondary genre
        }
        query.title = genreFilter; // Filter based on genre object
      }
    // Ensure at least one filter is provided
    



    // query v will be {} which is all books
    if(!req.query.pageNumber) books = await Book.find(query).sort({createdAt:1,authorId:1}).select("-updatedAt -coverImageUrl");
    else books = await Book.find(query).sort({createdAt:1,authorId:1}).select("-updatedAt -coverImageUrl").skip((req.query.pageNumber-1)*booksPerPage).limit(+booksPerPage);
    res.json(books)
});
const deleteBookById=asynchandler(async(req,res)=>{
const book=await Book.findById(req.params.id);
if(book.isPublished) return res.status(404).json({"message":"published book cant be deleted,make it unpublish first!"});
if(!book) return res.status(404).json({"message":"book not found"})
  await Book.findByIdAndDelete(req.params.id);
res.json({"message":"book has been deleted"});
});
const updateBookById=asynchandler(async(req,res)=>{
  
      



let book=await Book.findById(req.params.id);
if(book.isPublished) return res.status(404).json({"message":"published book cant be updated,make it unpublish first!"});
let filepath,openToRev,borrowable,minA,borrowableD,nbOfA,desc,tit;
if(req.body.description) desc=JSON.parse(req.body.description);
if(req.body.title) tit=JSON.parse(req.body.title)

if(req.body.minAge)minA=+req.body.minAge;
if(req.body.numberOfAvailableCopies)nbOfA=+req.body.numberOfAvailableCopies;
if(req.body.numberOfBorrowableDays)borrowableD=+req.body.numberOfBorrowableDays;
if(req.body.isOpenToReviews) openToRev=(req.body.isOpenToReviews==="true")?true:false;
if(req.body.isBorrowable)borrowable=(req.body.isBorrowable==="true")?true:false;

let {error}=validateUpdateBook({
  title:tit,
  isbn:req.body.isbn,
  genre:req.body.genre,
  description:desc,
  numberOfAvailableCopies:nbOfA,
  isOpenToReviews:openToRev,
  publishedDate:req.body.publishedDate,
  authorId:req.body.authorId,
  isBorrowable:borrowable,
  numberOfBorrowableDays:borrowableD,
  minAge:minA,
})
  if(error) return res.status(400).json({error})


   book=await Book.findByIdAndUpdate(req.params.id,{$set:{
    title:tit,
    isbn:req.body.isbn,
    genre:req.body.genre,
    description:desc,
    numberOfAvailableCopies:nbOfA,
    isOpenToReviews:openToRev,
    publishedDate:req.body.publishedDate,
    authorId:req.body.authorId,
    isBorrowable:borrowable,
    numberOfBorrowableDays:borrowableD,
    minAge:minA,
    coverImageUrl:req.file?.filename && "localhost:8000/images/"+req.file.filename
    }
  },{new:true});

  if(!book) return res.status(404).json("not found");

  res.json(book);
});
const publishBook=asynchandler(async(req,res)=>{

  const book=await Book.findById(req.params.id);
  if(!book) return res.status(404).json({'message':"user not found"})
    if(book.isPublished) return res.status(404).json({'message':"this book is already published!"});
  book.isPublished=true;
  await book.save();

  const members = await Member.find({ subscribedBooks: req.params.id });

  // Send an email to each subscribed member
  for (const member of members) {
       sendEmail(
      member.email,
      `New Book Published: ${book.title}`,
     '<h1>A new book you subscribed to is now published!</h1>'
    );
  }

  res.json({ message: 'Book published successfully', book });




});
const unPublishBook=asynchandler(async(req,res)=>{
  const book=await Book.findById(req.params.id);
  if(!book) return res.status(404).json({'message':"user not found"})
  if(!book.isPublished) return res.status(404).json({'message':"this book is already unpublished!"});
  book.isPublished=false;
  await book.save();
  res.json({ message: 'Book unpublished successfully', book })
});

const publishedBooksRate=asynchandler(async(req,res)=>{
const totalBooks=await Book.countDocuments();
const publishedBooks=await Book.countDocuments({isPublished:true});
const publishRate = (publishedBooks / totalBooks) * 100;
res.json({ publishRate });


});
const returnMembersRate= asynchandler(async (req, res) => {
  
  
  const result = await Member.aggregate([
    { $group: { _id: null, avgRate: { $avg: "$returnRate" } } }
]);

// Access the average rate from the result
const averageReturnRate = result.length > 0 ? result[0].avgRate : 0;

res.json({ averageReturnRate });
  
})
const getPublishedBooks=asynchandler(async(req,res)=>{

let query={isPublished:true};
let {lang='en',limit=3,genre,pageNumber=1}=req.query;
if(genre)query.genre=genre;
let publishedBooks=await Book.find(query).sort({numberOfAvailableCopies:-1}).select("title description genre coverImageUrl isBorrowable").limit(+limit).skip((pageNumber-1)*limit);

publishedBooks=publishedBooks.map((book)=>({title:book.title[lang],description:book.description[lang] ,genre:book.genre,coverImageUrl:book.coverImageUrl,isBorrowable:book.isBorrowable}));
res.json(publishedBooks);
})

 const createBookByIsbn=asynchandler(async(req,res)=>{
  const { isbn, numberOfAvailableCopies, isBorrowable, numberOfBorrowableDays, isOpenToReviews, minAge, authorId } = req.body;


 const response=await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`)
  
  const bookData = response.data[`ISBN:${isbn}`];

 if (!bookData) {
      return res.status(404).json({ message: 'Book not found in Open Library API.' });
    }


let {error}=validateCreateBook({
      title:{ en: bookData.title || 'Unknown Title', ar: 'يييييييييي' },
      isbn:isbn,
      genre:bookData.subjects?.[0]?.name || 'Unknown',
      description: { en: bookData.description?.value || 'No description available', ar: 'يييييييييي' },
      numberOfAvailableCopies:numberOfAvailableCopies || 1,
      isOpenToReviews: isOpenToReviews || true,
      publishedDate: bookData.publish_date ? String(new Date(bookData.publish_date)) : null,
      isPublished:true,
      authorId:authorId || "6772835ad77deb3805ea53b2",
      isBorrowable:isBorrowable || true,
      numberOfBorrowableDays:numberOfBorrowableDays || 14,
      minAge:minAge || 14,})
      if(error) return res.status(400).json({error})






    // Create the book in MongoDB
    const newBook = new Book({
      title: { en: bookData.title || 'Unknown Title', ar: 'يييييييييي' },
      isbn,
      genre: bookData.subjects?.[0]?.name || 'Unknown',
      description: { en: bookData.description?.value || 'No description available', ar: 'يييييييييي' },
      numberOfAvailableCopies: numberOfAvailableCopies || 1,
      isBorrowable: isBorrowable || true,
      numberOfBorrowableDays: numberOfBorrowableDays || 14,
      isOpenToReviews: isOpenToReviews || true,
      minAge: minAge || 0,
      authorId: authorId || "6772835ad77deb3805ea53b2",
      coverImageUrl: bookData.cover?.medium || '',
      publishedDate: bookData.publish_date ? new Date(bookData.publish_date) : null,
      isPublished: true,
    });

    await newBook.save();
    res.status(201).json(newBook);
 });
module.exports={createBookByIsbn,getPublishedBooks,returnMembersRate,publishedBooksRate,createBook,getBooks,getBookById,deleteBookById,updateBookById,publishBook,unPublishBook}