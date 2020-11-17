document.getElementById("send-mssg").addEventListener("click",submitForm);
var i = 0;
// var txt = "I'm Harsh Soni.";
var speed = 200;
document.getElementById("title-txt").innerHTML="";
var txt=[`<span id="iam">I'm </span>` ,`<span style="color:#5856d6">H</span>`,`<span style="color:#ff2d55">a</span>`,`<span style="color:#ffcc00">r</span>`,`<span style="color:#4cd964">s</span>`,`<span style="color:#ff9500">h </span>`,`<span style="color:#007AFF">S</span>`,`<span style="color:#4cd964">o</span>`,`<span style="color:#ff2d55">n</span>`,`<span style="color:#ffcc00">i</span>`,`<span>.</span>`];
var temp=``;

function typeWriter() {
  
  if (i < txt.length) {
    //document.getElementById("title-txt").innerHTML += txt.charAt(i);
    document.getElementById("title-txt").innerHTML=temp;
    document.getElementById("title-txt").innerHTML += txt[i];
    temp=document.getElementById("title-txt").innerHTML;
    document.getElementById("title-txt").innerHTML+='|';
    i++;
    setTimeout(typeWriter, speed);
  }
  
  else{
    document.getElementById("title-txt").innerHTML=temp;
    
  }
}


typeWriter();
function submitForm(){
    var name=document.getElementById("Name").value;
    var email=document.getElementById("Email").value;
    var subject=document.getElementById("Subject").value;
    var mssg=document.getElementById("Message").value;
    if(name.length==0 || email.length==0 || subject.length==0 || mssg.length==0){
        document.getElementById("alert").textContent="Please fill all fields!!";
        setTimeout(() => {
            document.getElementById("alert").textContent="";
        }, 1000);
    }
    else{
        var options={
            method:"POST",
            body:JSON.stringify({name,email,subject,mssg}),
            headers:{
                'Content-type':'application/json'
            }
          }
          fetch("/query",options)
            .then(res=>res.json())
            .then(data=>{
                console.log(data.mssg);
                document.getElementById("Name").value="";
                document.getElementById("Email").value="";
                document.getElementById("Subject").value="";
                document.getElementById("Message").value="";
            })    
              
    }
    
}
//bar animation on scroll

window.addEventListener("scroll",animate);
animate();      
function animate(){
  for(var i=1;i<=9;i++ ){
      var rect=document.getElementById(`bar${i}`).getBoundingClientRect();
      if(isInViewport(rect)){
        document.getElementById(`bar${i}`).style.animationPlayState='running';

      }
  }

}

function isInViewport(rect) {

var html = document.documentElement;
return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || html.clientHeight) &&
    rect.right <= (window.innerWidth || html.clientWidth)
);
}


function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  document.getElementById("Email").value=profile.getEmail();
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  
}
