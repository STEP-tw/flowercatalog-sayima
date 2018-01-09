let img;
const animate=function(){
  img.style.visibility='hidden';
  setTimeout(function(){ img.style.visibility='visible';  }, 1000);
};
const loadAnimation=function(){
  img=document.getElementById('gif');
  img.addEventListener("click",animate);
};
window.onload=loadAnimation;
