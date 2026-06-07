const express=require("express");
const cors=require("cors");
const { runPython }=require("./routes/python-runner");
const { runJava }=require("./routes/java-runner");

const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/asteroids", require("./routes/asteroids"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/ai-chat", require("./routes/gemini-chat"));
app.use("/api/nasa", require("./routes/nasa"));
app.use("/api/list-models", require("./routes/list-models"));
app.use("/api/gemini-test", require("./routes/gemini-test"));

app.get("/api/analysis", async(req,res)=>{
  const result=await runPython();
  res.json(result);
});

app.get("/api/java-report", async(req,res)=>{
  const result=await runJava();
  res.send(result);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Node backend running on ${PORT}`));
