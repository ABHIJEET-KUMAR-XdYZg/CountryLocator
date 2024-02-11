import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db=new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"world",
  password:"1@PLSQL",
  port:5432,
});

db.connect();

async function returnCountries(){
  const result=await db.query("SELECT * FROM visited_countries");
  var countryCodes="";
  var countCountries=0;
  result.rows.forEach(element => {
    countryCodes+=(element.country_code+',');
    countCountries++;
  });
  countryCodes=countryCodes.slice(0,-1);
  return [countryCodes,countCountries];
}

app.get("/", async (req, res) => {
  //Write your code here.
  var arr=await returnCountries();
  res.render("index.ejs",{total:arr[1],countries:arr[0]});
});

app.post("/add",async (req,res)=>{
  const result=await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",[req.body.country.toLowerCase()]);
  if(result.rows.length!=0){
    try{
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[result.rows[0].country_code]);
      res.redirect("/");
    }
    catch(error){
      console.log(error);
      var arr=await returnCountries();
      res.render("index.ejs",{
        error:"Country has already been added, try again.",
        total:arr[1],
        countries:arr[0],
      });
    }
  }
  else{
    var arr=await returnCountries();
    res.render("index.ejs",{
      error:"Country name does not exist, try again.",
      total:arr[1],
      countries:arr[0],
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});