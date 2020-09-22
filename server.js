const express=require("express");
const app =express();
const {google}=require('googleapis');
const keys=require('./keys.json');

const port=process.env.PORT || 5000;
app.listen(port,()=>console.log(`Server started at port ${port}...`));
app.use(express.static("public"));
app.use(express.json());

const client= new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
);

client.authorize((err,tokens)=>{
    if(err){
        console.log(err);
        return;
    }else{
        console.log("Spreadsheet Connected");
        
    }

})
app.post("/query",(req,res)=>{
    var newRow=[req.body.name,req.body.email,req.body.subject,req.body.mssg];
    gsrun(client,newRow);
    res.json({mssg:"Success"});
})

function gsrun(cl,newRow){
    const gsapi=google.sheets({version:'v4',auth:cl});

    const options={
        spreadsheetId:"1vZQ--CyVqgBjsrU-miPIgOLt75N_vzxWsbo6oW5RAGg",
        range:"Sheet1!A1",
        
        valueInputOption:'USER_ENTERED',
        
        resource:{values:[newRow]}
    };
    gsapi.spreadsheets.values.append(options);
   
        
}

