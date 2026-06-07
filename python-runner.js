const {spawn}=require("child_process");

function runPython(){
  return new Promise((resolve)=>{
    const py=spawn("python",["analysis.py"],{cwd:"../python-processing"});

    let data="";
    py.stdout.on("data",(d)=>data+=d.toString());
    py.on("close",()=>resolve(JSON.parse(data||"{}")));
  });
}

module.exports={runPython};
