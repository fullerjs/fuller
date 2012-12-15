#Hub
Self updating hub. Rest api. Login with apis.
```
fuller
 --hub=localhost:9874
 --new username password
 ```

#Client
Login to hub, save token somewhere.
commands
```
fuller
--update — self update
--deploy stage — stage update, migrate
--deploy production — production update, new dir for version, migrate
--revert production [version] — revert
```

#Plan.js
Tasks
```js
taskname = {
    command: "/path/to/run",
    help: "running stuff"
};

taskname = {
    commands: [
        "/path/to/run", 
        "/another/command
    ],
    help: "running stuff"
};
```
#Deploy
Using pkgcloud lib for creating cloud deployment
Cluster deployment through p2p between hubs.
Db migration with migranto
