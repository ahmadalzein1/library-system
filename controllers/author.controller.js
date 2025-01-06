const Author=require("../models/Author");
const asynchandler=require("express-async-handler");
const {validateCreateAuthor,validateUpdateAuthor}=require("../validations/author.validations");
const createAuhtor=asynchandler(async(req,res)=>{
const{error}=validateCreateAuthor(req.body);
if(error) return res.status(400).json(error);

let author= new Author({name:req.body.name,
email:req.body.email,
biography:req.body.biography,
profileImageUrl:req.body.profileImageUrl,
birthDate:req.body.birthDate
});
await author.save();
res.json(author);
});
const getAuthors=asynchandler(async(req,res)=>{
let authors=await Author.find();
res.json(authors);

});
const getAuthorById=asynchandler(async(req,res)=>{
     
    const languageHeader = req.headers['accept-language'] || 'en';


    const languages = languageHeader.split(',').map(lang => {
        const [code, qValue] = lang.split(';q=');
        return { 
            code: code.trim(), 
            q: qValue ? parseFloat(qValue.trim()) : 1.0 // Default q value is 1.0 if not specified
        };
    });

    // Sort languages by quality value (q) in descending order
    languages.sort((a, b) => b.q - a.q);



   const author=await Author.findById(req.params.id);
   if(!author) return res.status(404).json({'message':"author not found"})
let n,b;
for(lang of languages){
    if(author.name[lang.code] && author.biography[lang.code]){
        n=author.name[lang.code];b=author.biography[lang.code];
        break;
    }
}
if(!n && !b){n=author.name.en;b=n=author.biography.en}
let {name,biography,...others}=author._doc;
    res.json({n,b,...others});
    });

    const deleteUserById=asynchandler(async(req,res)=>{
        const author=await Author.findById(req.params.id);
        if(!author) return res.status(404).json({'message':"author not found"})
         await Author.findByIdAndDelete(req.params.id);
        res.json({message:"author has been deleted"});
         });
         const updateUserById=asynchandler(async(req,res)=>{

            const{error}=validateUpdateAuthor(req.body);
if(error) return res.status(400).json(error);

const author=await Author.findByIdAndUpdate(req.params.id,{$set:{
    name:req.body.name,
    email:req.body.email,
    biography:req.body.biography,
    profileImageUrl:req.body.profileImageUrl,
    birthDate:req.body.birthDate

}},{new:true})
if(!author) return res.status(404).json({message:"author not found"})
res.json(author);
         });

module.exports={createAuhtor,getAuthors,getAuthorById,deleteUserById,updateUserById}