const {exec}=require("child_process");

function runJava(){
  return new Promise((resolve)=>{
    exec("javac AsteroidProcessor.java && java AsteroidProcessor",
      {cwd:"../java-tool"},
      (err,stdout)=>resolve(stdout||"Error running Java"));
  });
}

module.exports={runJava};
