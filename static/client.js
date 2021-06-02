const request = indexedDB.open("library");
var localDB;

request.onupgradeneeded = function() {

  const db = request.result;
  const store = db.createObjectStore("books");
  const titleIndex = store.createIndex("by_title", "title", {unique: true});
  const authorIndex = store.createIndex("by_author", "author");

  // Populate with initial data.
  store.put({title: "Quarry Memories", author: "Fred", isbn: 123456});
  store.put({title: "Water Buffaloes", author: "Fred", isbn: 234567});
  store.put({title: "Bedrock Nights", author: "Barney", isbn: 345678});
};

request.onsuccess = function() {
  localDB = request.result;
};

