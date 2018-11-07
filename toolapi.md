#Fuller tool api

##simple

```js
module.exports = function(f, mat, options, next) {

}
```

    fuller.bind(toolInstance);
Bind tool and adds methods addTask, addTasks. Runs on tool as methods.

    addTask("taskname", data);
    addTasks("taskname", dataArray);
Add data to task queue.

###tasks queue
    addTask("taskname", data);
    addTasks("taskname", dataArray);

###watch files
    addDependence(master, slave);



