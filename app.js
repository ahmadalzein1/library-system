require("dotenv").config();
const express=require("express");
const app=express();
const mongoose=require('mongoose');
let PORT=process.env.PORT;
const authorsRoute=require("./routes/author.routes");
const membersRoute=require("./routes/member.routes");
const booksRoute=require("./routes/book.routes");
const logger=require('./middlewares/logger.middleware');
const path = require('path');
const { notFound, errorHandler } = require("./middlewares/errors");
app.use('/images',express.static(path.join(__dirname,"images")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(logger);
app.use("/api/authors",authorsRoute);
app.use("/api/members",membersRoute);
app.use("/api/books",booksRoute);

app.use(notFound);
app.use(errorHandler);
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("successed connection to db");
    app.listen(+PORT,()=>{console.log("listening in "+process.env.NODE_ENV+" on "+PORT)})
}).catch(err=>{console.log("cannot connect to db:")})
