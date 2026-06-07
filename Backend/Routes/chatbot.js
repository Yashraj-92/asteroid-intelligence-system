const express=require("express");
const router=express.Router();

const faq={
  "what is an asteroid":"Asteroids are rocky bodies orbiting the Sun.",
  "hazardous":"Hazardous means close + large enough to be dangerous.",
  "danger today":"Checking NASA data..."
};

router.post("/", (req,res)=>{
  const msg=req.body.message?.toLowerCase()||"";

  for(const k in faq){
    if(msg.includes(k)) return res.json({reply:faq[k]});
  }

  if(msg.includes("explain"))
    return res.json({reply:"NASA asteroid data includes speed, size, distance, hazard flag."});

  res.json({reply:"Ask me anything about asteroids!"});
});

module.exports=router;
