
function main() {
    update();
}
function update() {
    const url = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=01474500&parameterCd=00010&siteType=ST&siteStatus=all";
    fetch(url).then(x => {return x.json()}).then(
        data => {
            let source = data.value.timeSeries[0].sourceInfo.siteName;
            let update_time = data.value.timeSeries[0].values[0].value[0].dateTime;
            let temp = data.value.timeSeries[0].values[0].value[0].value;
            setRiverTemp(temp);
            setUpdateTime(update_time);
            setSourceInfo(source);
        });
}
function setRiverTemp(temp) {
    let celsius = document.getElementById("rd_c").checked;
    document.getElementById("rivertemp").innerText = "River Temp: " +  (celsius ? temp : celsiusToFahrenheit(temp)).toString().substring(0,4) + (celsius ? "°C" : "°F");

}
function setUpdateTime(dateTime) {
    document.getElementById("updated").innerText = "Last Updated: " + dateTime.substring(0,10);
}
function setSourceInfo(str){
    document.getElementById("source").innerText = str;
}
function celsiusToFahrenheit(celsius) {
    return (celsius * (9/5)) + 32
}
