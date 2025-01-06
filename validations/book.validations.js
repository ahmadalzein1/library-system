const joi=require("joi");
const jwt=require('jsonwebtoken');
const passwordComplexity=require("joi-password-complexity");
function validateCreateBook(obj){
    let schema=joi.object({
        isbn:joi.string().min(7).required().trim(),
       title:joi.object({en:joi.string().required().min(2).trim(),ar:joi.string().required().min(2).trim()}).required(),
       genre:joi.string().min(3).required().trim(),
       description:joi.object({en:joi.string().required().min(2).trim(),ar:joi.string().required().min(2).trim()}).required(),
       numberOfAvailableCopies:joi.number().min(0).required(),
       isOpenToReviews:joi.bool().required(),
       isPublished:joi.bool().required(),
       authorId:joi.string().min(8).required().trim(),
       isBorrowable:joi.bool().required(),
       numberOfBorrowableDays:joi.number().min(0).required(),
       minAge:joi.number().min(13).required(),
       publishedDate:joi.string().required().trim().min(10),
});
return schema.validate(obj);
}
function validateUpdateBook(obj){
    let schema=joi.object({
        isbn:joi.string().min(7).trim(),
       title:joi.object({en:joi.string().min(2).trim().required(),ar:joi.string().min(2).trim().required()}),
       genre:joi.string().min(3).max(20).trim(),
       description:joi.object({en:joi.string().min(2).trim().required(),ar:joi.string().min(2).trim().required()}),
       numberOfAvailableCopies:joi.number().min(0),
       isOpenToReviews:joi.bool(),
      
       authorId:joi.string().min(8).trim(),
       isBorrowable:joi.bool(),
       numberOfBorrowableDays:joi.number().min(0),
       minAge:joi.number().min(13),
       publishedDate:joi.string().trim().min(10),
});
return schema.validate(obj);
}
module.exports={validateCreateBook,validateUpdateBook};