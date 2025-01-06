const express=require("express");
const router=express.Router();
const memberHeaderChecking=require("../middlewares/memberOperations.middleware");
const {subsBook,unsubsBook,borrowsBook,createMember,getMembers,getMemberById,updateMemberById,deleteMemberById, returnsBook, getBorrowedBooksOfMember}=require("../controllers/member.controller")
router.route("/").post(createMember).get(getMembers);
router.route("/get-borrowed-books").get(memberHeaderChecking,getBorrowedBooksOfMember);
router.route("/:id").get(getMemberById).put(updateMemberById).delete(deleteMemberById);
router.route("/borrows-book/:id").post(memberHeaderChecking,borrowsBook);
router.route("/returns-book/:id").put(memberHeaderChecking,returnsBook);
router.route("/subs-book/:id").post(memberHeaderChecking,subsBook);
router.route("/unsubs-book/:id").post(memberHeaderChecking,unsubsBook);

module.exports=router;