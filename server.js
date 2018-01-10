let fs = require('fs');
let serveStaticFile=require('./staticFileHandler.js').serveStaticFile;
let handlerForGetGuestBook=require('./guestbookHandler.js').handlerForGetGuestBook;
let handlerForPostGuestBook=require('./guestbookHandler.js').handlerForPostGuestBook;
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');
let toS = o=>JSON.stringify(o,null,2);
const getRegisteredUser=function(){
  const registered_users=JSON.parse(fs.readFileSync('registeredusers.json','utf8'));
  return registered_users;
}

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
  let registered_users=getRegisteredUser();
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};

let redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/login.html']) && req.user) res.redirect('/guestbook.html');
};

let redirectLoggedOutUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/logout']) && !req.user) res.redirect('/index.html');
};

const handleSlash=(req,res)=>{
  let url=req.user ?'/guestbook.html':'/index.html';
  res.redirect(url);
};

const getData=(req,res)=>{
  res.writeHead(200,{'content-type':'text/javascript'});
  let commentsData=JSON.parse(fs.readFileSync('comments.json','utf8'));
  res.write(toS(commentsData));
  res.end();
};

const handlePostLogin =(req,res)=>{
  let registered_users=getRegisteredUser();
  console.log(registered_users);
  let user = registered_users.find(u=>u.userName==req.body.userName);
  if(!user) {
    res.redirect('/login.html');
    return;
  }
  let sessionid = new Date().getTime();
  user.sessionid = sessionid;

  fs.writeFileSync('registeredusers.json',toS(registered_users));
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  res.redirect('/guestbook.html');
};

const handleLogout=(req,res)=>{
  if(req.user)
    delete req.user.sessionid;
  res.setHeader('Set-Cookie',`sessionid=0; Expires=${new Date(1).toUTCString()}`);
  res.redirect('/index.html');
};

let app = WebApp.create();
app.use(logRequest);
app.use(loadUser);
app.use(redirectLoggedInUserToHome);
app.use(redirectLoggedOutUserToHome);
app.get('/',handleSlash);
app.post('/login',handlePostLogin);
app.get('/guestbook.html',handlerForGetGuestBook);
app.post('/guestbook',handlerForPostGuestBook);
app.get('/comments',getData);
app.get('/logout',handleLogout);
app.postProcess(serveStaticFile);

const PORT = 5000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
