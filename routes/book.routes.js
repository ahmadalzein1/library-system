const express=require("express");
const router=express.Router();
const {createBookByIsbn,getPublishedBooks,returnMembersRate,publishedBooksRate,createBook,getBooks,getBookById,deleteBookById,updateBookById,publishBook,unPublishBook}=require("../controllers/book.controller");
const { v4: uuidv4 } = require('uuid');

const multer=require("multer");
const path=require("path");
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        
        cb(null,path.join(__dirname,"..","images"))
        
    },
    filename:function(req,file,cb){
      
        cb(null,uuidv4()+"_"+file.originalname)
    }
});
const upload=multer({storage});




router.route("/").post(upload.single("image"),createBook).get(getBooks);
router.route("/create-book-by-isbn").post(createBookByIsbn);
router.route("/published-books").get(getPublishedBooks)
router.route("/:id").delete(deleteBookById).get(getBookById).put(upload.single("image"),updateBookById);
router.route("/publish/:id").put(publishBook);
router.route("/unpublish/:id").put(unPublishBook);
router.route("/kpi/books-publish-rate").get(publishedBooksRate);
router.route("/kpi/members-return-rate").get(returnMembersRate);


module.exports=router;