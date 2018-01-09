let fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');
let toS = o=>JSON.stringify(o,null,2);

  const registered_users=[
    {
      "userName" : "sayima",
      "password" : "12345"

    },
    {
      "userName" : "pragya",
      "password" : "12345"

    }
  ];

const getAllComments = function(){
  let commentsFileContent=fs.readFileSync('comments.json','utf8');
  let commentsData=JSON.parse(commentsFileContent);
  let content=`<pre>`;
  commentsData.map(function(element){
    content+=`
    Date:${element.date}
    Name:${element.name}
    Comment:${element.comment} <br><br>`;
  });
  content+=`</pre>`;
  return content;
};
const allComments=getAllComments();

let logRequest = (req,res)=>{
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`,''].join('\n');
  fs.appendFile('request.log',text,()=>{});

  console.log(`${req.method} ${req.url}`);
};

let loadUser = (req,res)=>{
  let sessionid = req.headers.cookie;
  console.log("=====>sessionid:",sessionid);
  let user = registered_users.find(u=>u.sessionid==sessionid);
  console.log("=====>user:",user);
  if(sessionid && user){
    req.user = user;
  }
};

const isFile = function(path){
  try{
    let stat= fs.statSync(path);
    return stat.isFile();
  }catch(e){
    return false;
  }
};

let serveStaticFile =(req,res)=>{
  let path='public'+req.url;
  if(isFile(path) && req.method=='GET'){
    let contentType=getContentType(req.url);
    let data=fs.readFileSync(path);
      res.writeHead(200,{'Content-Type':contentType});
      res.write(data);
      res.end();
  }
};

let redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/login.html']) && req.user) res.redirect('/guestbook.html');
};

let redirectLoggedOutUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/logout']) && !req.user) res.redirect('/index.html');
};

let getContentType = function(path){
  let contentTypes ={
    '.js' : 'text/javascript',
    '.html':'text/html',
    '.css' : 'text/css',
    '.jpg' :'image/jpg',
    '.jpeg':'image/jpeg',
    '.gif':'image/gif',
    '.pdf':'application/pdf'
  };
  let extension=path.slice(path.lastIndexOf('.'));
  if(contentTypes[extension])
    return contentTypes[extension];
  return 'text/plain';
};

const setSessionIdForUser= function(user,sessionid){

};

const handlerForGetGuestBook = function(req,res){

  res.writeHead(200,{'Content-Type':'text/html'});
  let fileContent=fs.readFileSync('./public/guestbook.html','utf8');
  const newfileContent=fileContent.replace(/USER_COMMENT/,allComments);
  res.write(newfileContent);
  res.end();
};
const addToDataBase=function(commentsDetails){
  let commentsFileContent=fs.readFileSync('comments.json','utf8');
  let commentsAsJSON=JSON.parse(commentsFileContent);
  commentsAsJSON.unshift(commentsDetails);
  let commentsData=JSON.stringify(commentsAsJSON,null,2);
  fs.writeFileSync('./comments.json',commentsData);
};


const parseUserData = function(userData){
  let commentAndName={};
  let commentParameter=userData.split('&');
  commentAndName.name=commentParameter[0].split('=')[1].split('+').join(' ');
  commentAndName.comment=commentParameter[1].split('=')[1].split('+').join(' ');
  return commentAndName;
};


const addUserData = function(req){
  let userData='';
  request.on('data',function(text){
    userData+=text;
  });
  request.on('end',function(){
    let commentAndName=parseUserData(userData);
    commentAndName.date=new Date().toLocaleString();
    addToDataBase(commentAndName);
  });
};

const handlePostGuestBook = function(req,res){
  if(!req.user) {
    res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/login.html');
    return;
  }
  console.log(req.user);
  addUserData(req);
  response.writeHead(302,{'Content-Type':'text/html','Location':'guestbook.html'});
  response.end();

};

const handleSlash=(req,res)=>{
  let url=req.user ?'/guestbook.html':'/index.html';
  res.redirect(url);
};

let app = WebApp.create();
app.use(logRequest);
app.use(loadUser);
app.use(redirectLoggedInUserToHome);
app.use(redirectLoggedOutUserToHome);

app.get('/',handleSlash);

app.post('/login',(req,res)=>{
  let user = registered_users.find(u=>u.userName==req.body.userName);
  console.log(user);
  if(!user) {
    res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/login.html');
    return;
  }
  let sessionid = new Date().getTime();
  user.sessionid = sessionid;
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  // setSessionIdForUser(user,sessionid);
  console.log(registered_users);
  res.redirect('/guestbook.html');
});

app.get('/guestbook.html',handlerForGetGuestBook);

app.post('/guestbook',handlePostGuestBook);

app.get('/logout',(req,res)=>{
  res.setHeader('Set-Cookie',[`loginFailed=false,Expires=${new Date(1).toUTCString()}`,`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/login');
});

app.postProcess(serveStaticFile);

const PORT = 5000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
