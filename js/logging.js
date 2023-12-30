const debugConsole=document.getElementById("loggingta")
const debugArea=document.getElementById("logging")

export function log(msg){
    debugConsole.value+="\n"+msg;
}

export function flog(thread,msg,lvl){
    if(lvl==undefined){lvl="INFO";}
    log("["+thread+"]"+"["+lvl+"] "+msg)
}