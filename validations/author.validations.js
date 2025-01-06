const joi=require("joi");
const jwt=require('jsonwebtoken');
const passwordComplexity=require("joi-password-complexity");
function validateCreateAuthor(obj){
    let schema=joi.object({
        email:joi.string().min(5).required().trim(),
        name:joi.object({en:joi.string().required().min(2).trim(),ar:joi.string().required().min(2).trim()}).required(),
        biography:joi.object({en:joi.string().required().min(2).trim(),ar:joi.string().required().min(2).trim()}).required(),
profileImageUrl:joi.string().min(10).trim(),
       birthDate:joi.string().required().trim().min(10),
});
return schema.validate(obj);
}
function validateUpdateAuthor(obj){
    let schema=joi.object({
        email:joi.string().min(5).trim(),
        name:joi.object({en:joi.string().min(2).trim().required(),ar:joi.string().required().min(2).trim()}),
        biography:joi.object({en:joi.string().required().min(2).trim(),ar:joi.string().required().min(2).trim()}),
profileImageUrl:joi.string().min(10).trim(),
       birthDate:joi.string().trim().min(10),
});
return schema.validate(obj);
}
module.exports={validateCreateAuthor,validateUpdateAuthor};