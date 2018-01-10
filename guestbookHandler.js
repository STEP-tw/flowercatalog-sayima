let fs=require('fs');
let toS = o=>JSON.stringify(o,null,2);
const handlerForGetGuestBook = function(req,res){
  res.writeHead(200,{'Content-Type':'text/html'});
  let fileContent=fs.readFileSync('./public/guestbook.html','utf8');
  if(req.user){
    let fileData=fileContent.replace(/User/,req.user.userName);
    res.write(fileData);
    res.end();
    return;
  }
  res.write(fileContent);
  res.end();
};

const addToDataBase=function(commentsDetails){
  let commentsFileContent=fs.readFileSync('comments.json','utf8');
  let commentsAsJSON=JSON.parse(commentsFileContent);
  commentsAsJSON.unshift(commentsDetails);
  let commentsData=toS(commentsAsJSON);
  fs.writeFileSync('./comments.json',commentsData);
};

const addUserData = function(req){
  let commentAndName=req.body;
  commentAndName.date=new Date().toLocaleString();
  addToDataBase(commentAndName);
};

const handlerForPostGuestBook = function(req,res){
  if(!req.user) {
    res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/login.html');
    return;
  }
  addUserData(req);
  res.writeHead(302,{'Content-Type':'text/html','Location':'guestbook.html'});
  res.end();

};



exports.handlerForGetGuestBook=handlerForGetGuestBook;
exports.handlerForPostGuestBook=handlerForPostGuestBook;
