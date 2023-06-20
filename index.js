//jshint esversion:6
//new version of mongod no need loadash
//const _ = require('loadash');
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
// to acccess custom node module created by us follow the same as below this date.js is local not installed using npm
// const date = require(__dirname + "/date.js");
//console.log(date());

// refer const documentation for array and object it's different - it can vary tha value but it can't be assigned to a new array

const app = express();
app.set('view engine', 'ejs');
const PORT = process.env.PORT || 3000;
//app.set("view engine", "ejs"); // this line should placed below app=express() not above of that.
//to avoid warnings mongoose.set

mongoose.set('strictQuery', false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected: ${conn.connection.host});
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




  // const itemSchema = new mongoose.Schema({
  // name: string
  // });

  const itemSchema = {
    name: String
  };

  const Item = mongoose.model("Items", itemSchema);

  const work = new Item({
    name: "Work Hard"
  });
  const explore = new Item({
    name: "Explore"
  });
  const experience = new Item({
    name: "Experience"
  });

  const defaultItems = [work, explore, experience];

   // Item.insertMany(defaultItems).then(function(){console.log("Success")})
   // .catch(function(err){
   //   console.log(err)});

   const listSchema ={
     name : String,
     itemsList: [itemSchema]
   };

   const List = mongoose.model("Lists", listSchema);

  app.get("/",function(req,res){

      // const newItems = Item.find();
      run().catch(console.dir);
      async function run(){
      if(defaultItems.length === 0){
        await Item.insertMany(defaultItems);
        console.log(await Item.insertMany(defaultItems));
          }
    const item = await Item.find({});


    res.render("list", {listTitle: "Today", newListItem: item});
    }
});


app.get("/:toDolistName",function(req,res){
//  console.log(req.params.toDolistName);
//  const customListName = _.capitalize(req.params.toDolistName);
  run().catch(console.dir);
  async function run(){
//  const customListName = req.params.toDolistName;
//for neat work capitalizing
const customListName = _.capitalize(req.params.toDolistName);
  const foundList = await List.findOne({name: customListName})
  if(!foundList){
    //Create a new list
    const list = new List({
      name: customListName,
      itemsList :  defaultItems
    })

  list.save();
  res.redirect("/" + customListName);
  }else{
    //display an existingn list
    res.render("list",{listTitle: foundList.name, newListItem: foundList.itemsList});
  }
}
});

  app.post("/",async function(req,res){

      //local variable scope is inside so at top creating a newItems as empty string global variable
      const itemName = req.body.newItem;
      const listName = req.body.list;

        const item = new Item({
          name: itemName
        });

          if(listName === "Today"){
        //defaultItems.push(item);// push doesn't save in backend
        item.save();
        res.redirect("/");
      }
      else{
        await List.findOne({name: listName}).then(function(foundList)
    {
      foundList.itemsList.push(item)
      foundList.save();
      res.redirect("/" + listName);
    });
}
});

      //throws error above render line gets crash so add newlistitem to thw first render and redirect here
      //response.render("list", {newListItem: newItems});

      // "/" - redirect to app.get('/') - because here only we are calling the home page



  app.post("/delete",function(req, res) {
    run().catch(console.dir);
    async function run(){
    //console.log(req.body.checedkbox);
    const checkedItem = req.body.checedkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
    await Item.findByIdAndRemove(checkedItem);
    res.redirect("/");
  }
    else{
      await List.findOneAndUpdate({name: listName},{$pull: {itemsList: {_id: checkedItem}}});
      res.redirect("/" + listName);
    }
    }
  });



  app.get("/about", function(req,res){
    res.render("about");
  });



connectDB().then(() => {
  app.listen(PORT, () => {
      console.log('Server started on port 3000 ${PORT}');
  });
});
