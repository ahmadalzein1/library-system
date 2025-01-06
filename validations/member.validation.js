const joi=require("joi");
const jwt=require('jsonwebtoken');
const passwordComplexity=require("joi-password-complexity");
function validateCreateMember(obj){
    let schema=joi.object({
       name: joi.string().required().trim().min(5).max(15),
           email: joi.string().required().trim().min(5),
           username:joi.string().required().trim().min(5),
           subscribedBooks:joi.array().items(joi.string().trim().min(5)),
           returnRate: joi.number(),
           borrowedBooks:joi.array().items(joi.object({borrowedBookId:joi.string().required().trim().min(10),borrowedDate:joi.string().required().trim().min(10),returnDate:joi.string().required().trim().min(10)})),
          birthDate:joi.string().required().trim().min(10),
});
return schema.validate(obj);
}
function validateUpdateMember(obj){
    let schema=joi.object({
        name: joi.string().trim().min(5).max(15),
        email: joi.string().trim().min(5),
        username:joi.string().trim().min(5),
        subscribedBooks:joi.array().items(joi.string().trim().min(5)),
        returnRate: joi.number(),
        borrowedBooks:joi.array().items(joi.object({borrowedBookId:joi.string().required().trim().min(10),borrowedDate:joi.string().required().trim().min(10),returnDate:joi.string().required().trim().min(10)})),
       birthDate:joi.string().trim().min(10),
});
return schema.validate(obj);
}
module.exports={validateCreateMember,validateUpdateMember};