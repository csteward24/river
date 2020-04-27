//const http = require('http');
const mysql = require('promise-mysql');
const fetch = require("node-fetch");

const db_con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "river_data"
});

//initialization
const express = require('express');
const app = express();
const port = 3000;
app.set('view engine', 'pug');

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

update_USGS();
update_OWM();
//routes
app.get('/', function (req, res) {
    let water_data_promise = db_con.then(db => db.query(`SELECT location,value FROM temp ORDER BY time DESC LIMIT 1 `));
    let air_data_promise = db_con.then(db => db.query(`SELECT temp,weather FROM weather ORDER BY id DESC LIMIT 1`));
    let location_data_promise = db_con.then(db => db.query(`SELECT DISTINCT location FROM temp ORDER BY time DESC`));
    Promise.all([water_data_promise,air_data_promise,location_data_promise]).then(data => {
        data = [data[0][0],data[1][0],data[2]];
        res.render('river', { title: 'River', source: data[0].location,
            water_temp: data[0].value, air_temp: data[1].temp, weather: data[1].weather, Locations:data[2]});
        console.log("page rendered")},
        error => {console.log("error: ", error)})

});

function update_USGS(){
    console.log("USGS data updated");
    const url = "https://waterservices.usgs.gov/nwis/iv/?format=json&countyCd=42101&parameterCd=00010&siteType=ST&siteStatus=all";
    let json_promise = fetch(url).then(x => {return x.json()});
    Promise.all([json_promise,db_con]).then(data => {
        var vals = [];
        data[0].value.timeSeries.forEach(x => {vals.push([x.sourceInfo.siteName,x.values[0].value[0].value,x.values[0].value[0].dateTime])});
        data[1].query("INSERT INTO temp(location,value,time) VALUES ?",[vals]);
    })
}
function update_OWM(){
    console.log("OWM data updated");
    const url = 'http://api.openweathermap.org/data/2.5/group?id=5205788&units=imperial&APPID=ffd8afa9a03c59a8124a9e28b21048c9';
    let json_promise = fetch(url).then(x => {return x.json()});
    Promise.all([json_promise,db_con]).then(data => {
        var vals = [];
        console.log(data[0].list[0].weather[0].main);
        data[0].list.forEach(x => {vals.push([x.name,x.id,x.main.temp,x.weather[0].main])});
        data[1].query("INSERT INTO weather(location_name,location_id,temp,weather) VALUES ?",[vals]);
    })

}
