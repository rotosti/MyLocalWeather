var apiKey = 'e4d72f06208b37409b1c4c29f0f46ed8';
var searchCity = 'Chicago';

var searchBtn = $('#searchButton');
var searchField = $('#searchInput');

var searchHistoryList = $('#search-history');

var recentSearches = [];
var maxInHistoryList = 10;

// get coords from one api call
// take city name and add to list
// update list on screen
function searchWeatherData(event) {

    var search;

    if (searchField.val() === "") {
        search = $(event.target).text();
    } else {
        search = searchField.val();
    }

    console.log(search);

    if (!recentSearches.includes(search)) {
        recentSearches.unshift(search);
    } else {
        var index = recentSearches.indexOf(search);
        recentSearches.splice(index, 1);
        console.log(search);
        recentSearches.unshift(search);
    }

    updateSearchList();
    

    // var url = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${apiKey}`;

    // fetch(url)
    // .then(function (response) {
    //   return response.json();
    // })
    // .then(function (data) {
    //   console.log(data);
    // });

}

searchBtn.on('click', searchWeatherData);

function updateSearchList() {

    if (recentSearches.length > maxInHistoryList) {
        recentSearches.pop();
    }

    localStorage.setItem('searches', JSON.stringify(recentSearches));

    searchHistoryList.empty();
    
    for (var i = 0; i < recentSearches.length; i++) {
        searchHistoryList.append(`<button type="button" class="recent-search-btn list-group-item list-group-item-action py-3">${recentSearches[i]}</button>`);
    }

    searchField.val("");
}

searchHistoryList.on('click', ".recent-search-btn", searchWeatherData);

function init() {

    recentSearches = JSON.parse(localStorage.getItem('searches')) || [];
    updateSearchList();
}

init();