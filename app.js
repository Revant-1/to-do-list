//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const items = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to database!');
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item ({
name: "Welcome to todo list"
})

const item2 = new Item ({
  name: "hit + to add more"
  })

  const item3 = new Item ({
    name: "Let's Go"
    })

const defaultItems = [item1,item2,item3];

/*Item.insertMany(defaultItems)*/

const workItems = [];

  app.get('/', (req, res) => {
    Item.find({})
      .then((items) => {
        if(items.length === 0){
        Item.insertMany(defaultItems);
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: items});
      }

      })
      .catch((error) => {
        console.log('Error retrieving items:', error);
        res.status(500).send('Internal Server Error');
      });
     // console.log(items);
     
  });
   

// work on this !!!!!

app.post("/", function(req, res){

  const newCompo = req.body.newItem;
  const listName =  req.body.list;
  const itemName = new Item ({
    name: newCompo
    })
 if(listName == "Today"){
    itemName.save();
  res.redirect("/");}
  else{
    List.findOne({name: listName})
    .then((foundList) => {
      foundList.items.push(itemName);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
 // console.log(listName);
});

app.post("/delete", function(req, res){

 const deleteId = req.body.checkBox;

/*Item.deleteOne({ _id: deleteId})*/
// REMOVES DATA FROM THE LIST.
Item.findByIdAndRemove(deleteId)
  .then((removedItem) => {
    if (removedItem) {
      // Item successfully removed
     // console.log('Item removed:', removedItem);
    } else {
      // Item not found
      console.log('Item not found');
    }
  })
  .catch((error) => {
    // Error occurred while removing item
    console.log('Error removing item:', error);
  });
  res.redirect("/");

});

const listSchema = new mongoose.Schema({
  name: String ,
  items:[itemsSchema] 
});

const List= mongoose.model("List", listSchema)

// creating custom express parameters amd new pages for ToDolist 

app.get('/:customListName', function(req , res){
 // console.log(req.params.customListName);
 // res.render('list' + req.params.customListName);
const link = req.params.customListName;

List.findOne({ name: link })
  .then((foundList) => {
    if (!foundList) {
      console.log('List exists');
      const list = new List({
        name: link ,
        items: defaultItems
      });
      list.save();
      res.redirect('/' + link);
    } else {
      res.render('list' , {listTitle: foundList.name, newListItems: items});
      console.log('List does not exist');
    }
  })
  .catch((err) => {
    console.log('Error:', err);
  });

 });

/*
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});*/


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
