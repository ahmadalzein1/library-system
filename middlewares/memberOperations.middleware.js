const Member=require("../models/Member");
const mongoose=require("mongoose")
const asynchandler=require("express-async-handler");


const memberHeaderChecking=asynchandler(async(req,res,next)=>{
const memberId=req.header("X-Member-ID");
if(!memberId) return res.status(400).json({message:"member id is required"});
const member=await Member.findById(memberId);
if(!member) return res.status(404).json({message:"member not found "});
req.member=member;
next();
});
module.exports=memberHeaderChecking;