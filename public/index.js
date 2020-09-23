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
//google pay api integration


const canMakePaymentCache = 'canMakePaymentCache';

function checkCanMakePayment(request) {
  // Check canMakePayment cache, use cache result directly if it exists.
  if (sessionStorage.hasOwnProperty(canMakePaymentCache)) {
    return Promise.resolve(JSON.parse(sessionStorage[canMakePaymentCache]));
  }

  // If canMakePayment() isn't available, default to assume the method is
  // supported.
  var canMakePaymentPromise = Promise.resolve(true);

  // Feature detect canMakePayment().
  if (request.canMakePayment) {
    canMakePaymentPromise = request.canMakePayment();
  }

  return canMakePaymentPromise
      .then((result) => {
        // Store the result in cache for future usage.
        sessionStorage[canMakePaymentCache] = result;
        return result;
      })
      .catch((err) => {
        console.log('Error calling canMakePayment: ' + err);
      });
}


/** Launches payment request flow when user taps on buy button. */
function onBuyClicked() {
  
  if (!window.PaymentRequest) {
    console.log('Web payments are not supported in this browser.');
    return;
  }

  // Create supported payment method.
  const supportedInstruments = [
    {
      supportedMethods: ['https://tez.google.com/pay'],
      data: {
        pa: 'harshsoniji@ybl',
        pn: 'Harsh Soni',
        tr: '1234ABCD',  // Your custom transaction reference ID
        url: 'https://url/of/the/order/in/your/website',
        mc: '1234', //Your merchant category code
        tn: 'Purchase in Merchant',
      },
    }
  ];

  // Create order detail data.
  const details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'INR',
        value: '10', // sample amount
      },
    },
    displayItems: [{
      label: 'Original Amount',
      amount: {
        currency: 'INR',
        value: '10',
      },
    }],
  };

  // Create payment request object.
  let request = null;
  try {
    request = new PaymentRequest(supportedInstruments, details);
  } catch (e) {
    console.log('Payment Request Error: ' + e.message);
    return;
  }
  if (!request) {
    console.log('Web payments are not supported in this browser.');
    return;
  }

  var canMakePaymentPromise = checkCanMakePayment(request);
  canMakePaymentPromise
      .then((result) => {
        showPaymentUI(request, result);
      })
      .catch((err) => {
        console.log('Error calling checkCanMakePayment: ' + err);
      });
}


/**
* Show the payment request UI.
*
* @private
* @param {PaymentRequest} request The payment request object.
* @param {Promise} canMakePayment The promise for whether can make payment.
*/
function showPaymentUI(request, canMakePayment) {
  if (!canMakePayment) {
    handleNotReadyToPay();
    return;
  }
 
  // Set payment timeout.
  let paymentTimeout = window.setTimeout(function() {
    window.clearTimeout(paymentTimeout);
    request.abort()
        .then(function() {
          console.log('Payment timed out after 20 minutes.');
        })
        .catch(function() {
          console.log('Unable to abort, user is in the process of paying.');
        });
  }, 20 * 60 * 1000); /* 20 minutes */
 
  request.show()
      .then(function(instrument) {
 
        window.clearTimeout(paymentTimeout);
        processResponse(instrument); // Handle response from browser.
      })
      .catch(function(err) {
        console.log(err);
      });
 }

 
/**
* Process the response from browser.
*
* @private
* @param {PaymentResponse} instrument The payment instrument that was authed.
*/
function processResponse(instrument) {
  var instrumentString = instrumentToJsonString(instrument);
  console.log(instrumentString);
 
  fetch('/buy', {
    method: 'POST',
    headers: new Headers({'Content-Type': 'application/json'}),
    body: instrumentString,
  })
      .then(function(buyResult) {
        if (buyResult.ok) {
          return buyResult.json();
        }
        console.log('Error sending instrument to server.');
      })
      .then(function(buyResultJson) {
        completePayment(instrument, buyResultJson.status, buyResultJson.message);
 
      })
      .catch(function(err) {
        console.log('Unable to process payment. ' + err);
      });
 }
 
 /**
 * Notify browser that the instrument authorization has completed.
 *
 * @private
 * @param {PaymentResponse} instrument The payment instrument that was authed.
 * @param {string} result Whether the auth was successful. Should be either
 * 'success' or 'fail'.
 * @param {string} msg The message to log in console.
 */
 function completePayment(instrument, result, msg) {
  instrument.complete(result)
      .then(function() {
        console.log('Payment succeeds.');
        console.log(msg);
      })
      .catch(function(err) {
        console.log(err);
      });
 }
/** Handle Google Pay not ready to pay case. */
function handleNotReadyToPay() {
  alert('Google Pay is not ready to pay.');
}

function paymentResponseToJsonString(paymentResponse) {
  // PaymentResponse is an interface, JSON.stringify works only on dictionaries.
  var paymentResponseDictionary = {
    methodName:paymentResponse.methodName,
    details:paymentResponse.details,
    shippingAddress: addressToJsonString(paymentResponse.shippingAddress),
    shippingOption: paymentResponse.shippingOption,
    payerName: paymentResponse.payerName,
    payerPhone: paymentResponse.payerPhone,
    payerEmail: paymentResponse.payerEmail,
  };
  return JSON.stringify(paymentResponseDictionary, undefined, 2);
} 
