const express=require("express");
const router=express.Router();
const {updateUserById,deleteUserById,createAuhtor,getAuthors,getAuthorById}=require("../controllers/author.controller")
router.route("/").post(createAuhtor).get(getAuthors);
router.route("/:id").get(getAuthorById).delete(deleteUserById).put(updateUserById);

module.exports=router;