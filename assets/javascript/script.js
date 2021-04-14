// api key - will be removed once code review is completed
var apiKey = 'e4d72f06208b37409b1c4c29f0f46ed8';
// jQuery the search field and button for the form to search by city name
var searchBtn = $('#searchButton');
var searchField = $('#searchInput');
// container for search history
var searchHistoryList = $('#search-history');
// array for javascript to properly deal with recent searches and recent search limit
var recentSearches = [];
var maxInHistoryList = 10;
// weather data object, is reused on new searches, stores all the information about current
// weather and forecasts
var cityWeatherData = {
    cityName: "",
    cityLong: "",
    cityLat: "",
    currentDataDate: "",
    cityCurrentImg: "",
    cityCurrentImgDesc: "",
    cityCurrentTemp: "",
    cityCurrentHumidity: "",
    cityCurrentWindSpeed: "",
    cityCurrentUVIndex: "",
    futureForcast: [{
        date: "",
        imgURL: "",
        temp: "",
        humidity: "" 
    }, {
        date: "",
        imgURL: "",
        temp: "",
        humidity: "" 
    }, {
        date: "",
        imgURL: "",
        temp: "",
        humidity: "" 
    }, {
        date: "",
        imgURL: "",
        temp: "",
        humidity: "" 
    }, {
        date: "",
        imgURL: "",
        temp: "",
        humidity: "" 
    }, ]
}
// primary search function, is the first step in a set of 3 functions which gather data and update
// the weather cards on the screen; handles repeat clicks in the search history
function searchWeatherData(event) {
    // variable for the city search
    var search;
    // checks to see if there is anything in the text field, if not, the call must have been by the previous search buttons
    if (searchField.val() === "") {
        // takes the data from the previous search buttons based on the button that made the function call
        search = $(event.target).text();
    } else {
        // takes the information from the input field
        search = searchField.val();
    }
    // updates the array of recent city searches based on if it the city already exists in the recent search history, if not 
    // moves the most recent search to the top
    if (!recentSearches.includes(search)) {
        recentSearches.unshift(search);
    } else {
        // moves repeat search to top of recent search list
        var index = recentSearches.indexOf(search);
        recentSearches.splice(index, 1);
        recentSearches.unshift(search);
    }
    // makes function call to update the recent searches and for local storage 
    updateSearchList();
    // url to get lat and long for full call
    var url = `https://api.openweathermap.org/data/2.5/weather?q=${search}&units=imperial&appid=${apiKey}`;
    // makes the api call
    fetch(url)
    // returns a json object based on a server response
    .then(function (response) {
        return response.json();
    })
    // processes name and longitude and latitude of city based on one api call
    .then(function (data) {
        // sets weather data object members
        cityWeatherData.cityName = data.name;
        cityWeatherData.cityLat = data.coord.lat;
        cityWeatherData.cityLong = data.coord.lon;
        // calls step 2 of data collection from another api call
        getAdditionalWeatherData();        
    // basic error handling for anthing that is not a 200 code, will terminate function
    }).catch(function(error) {
        return;
    });
}
// step 2 of data collection, additional api call with more details to be put in the weather object
function getAdditionalWeatherData() {
    // url for 2nd api call
    var url = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityWeatherData.cityLat}&lon=${cityWeatherData.cityLong}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`
    // api call via fetch
    fetch(url)
    .then(function (response2) {
        //returns json object based on server response
        return response2.json();
    })
    .then(function (data2) {
        // adds date for the current search to adjust for actual date in the search location
        cityWeatherData.currentDataDate = (moment.unix(data2.current.dt+(data2.timezone_offset))).utc().format("M/D/YY");
        // gets the correct icon based on the data
        cityWeatherData.cityCurrentImg = `http://openweathermap.org/img/wn/${data2.current.weather[0].icon}@2x.png`;
        // gets the alt text discription
        cityWeatherData.cityCurrentImgDesc = data2.current.weather[0].description;
        // gets the current temp of the search location and rounds down to whole number
        cityWeatherData.cityCurrentTemp = Math.floor(data2.current.temp);
        // gets humidity and rounds down to whole number
        cityWeatherData.cityCurrentHumidity = Math.floor(data2.current.humidity);
        // gets wind speeds and rounds down to whole number
        cityWeatherData.cityCurrentWindSpeed = Math.floor(data2.current.wind_speed);
        // gets UV index 
        cityWeatherData.cityCurrentUVIndex = data2.current.uvi;
        // for loop to get 5 days and full in forecast data in the weather object
        for (var i = 0; i < 5; i++) {
            // adds future forecast date for the current search to adjust for actual dates for the forecast in the search location
            cityWeatherData.futureForcast[i].date = (moment.unix(data2.daily[i+1].dt+(data2.timezone_offset))).utc().format("M/D/YY");
            // gets the icon based on the forecast
            cityWeatherData.futureForcast[i].imgURL = `http://openweathermap.org/img/wn/${data2.daily[i+1].weather[0].icon}@2x.png`;
            // gets the temp for the specific date
            cityWeatherData.futureForcast[i].temp = Math.floor(data2.daily[i+1].temp.day);
            // gets the humity for the specific data
            cityWeatherData.futureForcast[i].humidity = Math.floor(data2.daily[i+1].humidity);
        }
        // calls step 3 to update the information on display on the webpage
        updateWeatherCards();  
    });
}
// updates the cards on the web page which the user will be able to see
function updateWeatherCards() {
    // variable to store background and text colors of the uv index
    var uvBackground = "";
    // adjustment of uv index background and text colors
    if (cityWeatherData.cityCurrentUVIndex <= 2) {
        uvBackground = "bg-success text-light";
    } else if (cityWeatherData.cityCurrentUVIndex > 2 && cityWeatherData.cityCurrentUVIndex <= 6) {
        uvBackground = "bg-warning text-dark";
    } else {
        uvBackground = "bg-danger text-light";
    }
    //clears the current weather card container to dynamically remake the card
    $('#current-weather-card').empty();
    // remake of the card for dynamic reload on search
    $('#current-weather-card').append(`<div class="card-body">` +
                                      `<h2 class="card-title mb-4">${cityWeatherData.cityName} (${cityWeatherData.currentDataDate}) <img src="${cityWeatherData.cityCurrentImg}" alt="${cityWeatherData.cityCurrentImgDesc}"></h2>` +
                                      `<p class="card-text mb-3">Temperature: ${cityWeatherData.cityCurrentTemp}&#730F</p>` +
                                      `<p class="card-text mb-3">Humidity: ${cityWeatherData.cityCurrentHumidity}%</p>` +
                                      `<p class="card-text mb-3">Wind Speed: ${cityWeatherData.cityCurrentWindSpeed} MPH</p>` +
                                      `<p class="card-text mb-3">UV Index: <span class="p-2 rounded ${uvBackground}">${cityWeatherData.cityCurrentUVIndex}</span></p></div>`);
    // clears the 5 day forecast cards container to dynamically remake the cards
    $('#forcast-cards-container').empty();
    // loop to generate the forecast cards with the information from the forecast member of the weather object
    for (var j = 0; j < 5; j++) {
        $('#forcast-cards-container').append(`<div class="card text-white bg-primary mb-3" style="width: 18%">` +
                                             `<div class="card-body">` +
                                             `<h5 class="card-title mb-4">${cityWeatherData.futureForcast[j].date}</h5>` +
                                             `<p class="card-text"><img src="${cityWeatherData.futureForcast[j].imgURL}"></p>` +
                                             `<p class="card-text">Temp: ${cityWeatherData.futureForcast[j].temp}&#730F</p>` +
                                             `<p class="card-text">Humidity: ${cityWeatherData.futureForcast[j].humidity}%</p></div></div>`);
    }
}
// event handler for the search button click
searchBtn.on('click', function(e) {
    // stops any weird behavior
    e.preventDefault();
    // checks to see if the button was clicked and there was no information entered, returns if empty
    if (searchField.val() === "") {
        return;
    }
    // calls step one in weather data gathering process
    searchWeatherData(e);
});
// event handler for the form
$('#city-search-form').on("submit", function(e) {
    // prevents refresh of the page on submit events
    e.preventDefault();
    // checks to see if the button was clicked and there was no information entered, returns if empty
    if (searchField.val() === "") {
        return;
    }
    // calls step one in weather data gathering process
    searchWeatherData(e);
});
// function which updates the recent searches and stores the information in local storage
function updateSearchList() {
    // checks to see if the recent searchs have more than the max allowed in the search history
    if (recentSearches.length > maxInHistoryList) {
        // removes the last in the search history if there more than the allowed previous searches
        recentSearches.pop();
    }
    // stores the updates recent searches in local storage
    localStorage.setItem('searches', JSON.stringify(recentSearches));
    // clears the list on the web page to remake in the event the order needs reshifting
    searchHistoryList.empty();
    // loop to create recent search history as buttons
    for (var i = 0; i < recentSearches.length; i++) {
        searchHistoryList.append(`<button type="button" class="recent-search-btn list-group-item list-group-item-action py-3">${recentSearches[i]}</button>`);
    }
    // resets the search field to be empty
    searchField.val("");
}
//event handler for the recent search list
searchHistoryList.on('click', ".recent-search-btn", searchWeatherData);
// initialization function to gather any stored searches in the local storage
function init() {
    // checks to see if there is anything in the local storage, if not, will set the recent searches to an empty array
    recentSearches = JSON.parse(localStorage.getItem('searches')) || [];
    // remakes the recent searches
    updateSearchList();
}
// initialization call
init();
