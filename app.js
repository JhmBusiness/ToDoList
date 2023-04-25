//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://jhmbusiness:eurRUwHyozMUrHBr@todolist.yfrlcxp.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = ({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- hit this to delete an item.>"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  async function findItems() {
    const foundItems = await Item.find({});

    if (foundItems.length === 0) {
      let doc = await Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }};

  findItems();

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    async function findListName(){
      const foundListName = await List.findOne({name: listName});
      foundListName.items.push(newItem);
      foundListName.save();
      res.redirect("/" + listName);
    };
    findListName();
  };
});

app.post("/delete", function(req, res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    async function removeItem() {
      let doc = await Item.deleteOne({ _id: checkItemId });
    }
    removeItem();
    res.redirect("/");
  } else {
    async function secondRemoveItem() {
      try{
        let doc = await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}});
        res.redirect("/" + listName);
      }
      catch (error) {
        res.redirect("/" + listName);
      }
    }
    secondRemoveItem();
  };
  
});

app.get("/:listName", function(req, res){
  const listName = _.capitalize(req.params.listName);

  async function checkList() {

    try{
      const foundList = await List.findOne({name: listName});
      // console.log(foundList.name);
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    catch (error){
      console.log("A new list has been created!");

      const list = new List({
        name: listName,
        items: defaultItems
      });
      list.save();
      checkList();
    };
  };
  checkList();

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
