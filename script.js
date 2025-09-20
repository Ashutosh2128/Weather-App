const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container");

//initially variables need???
let oldTab = userTab;
const API_KEY = "42dc450fbe20360d2dd2c48cd971036b";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            //kya search form bala container is invisible, if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active"); 
        }
        else {
            //me pehele search wale tab par tha, ab your weather tab visible karna padega
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna padega, so let's check local storage first for coordinates, if we have saved them there
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener('click', () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});

//check if coordinates are already present in session storage 
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates)
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;

    //make grant container and error container invisible 
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active")
    //make loader visible
    loadingScreen.classList.add("active");

    //API call
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        //make loader invisible
        loadingScreen.classList.remove("active");
        //make user info container visible
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        //HW
        alert("User info not found");
    }
}

function renderWeatherInfo(weatherInfo) {
    //firstly we have to fetch element
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //Fetch value from weatherInfo object and put it UI elements 
    cityName.innerText = weatherInfo.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, handleGeoError);
    }
    else {
        //HW- show an alert for no geolocation support available
        alert("Geolocation is not supported by your browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

function handleGeoError(error) {
    // Show an alert or a UI message
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Geolocation access denied. Please allow location access to view weather for your area.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get your location timed out.");
            break;
        default:
            alert("An unknown error occurred while fetching location.");
            // break;
    }
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click', getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let cityName = searchInput.value.trim();
    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);

    //Remove value in search input, once fetch the data
    searchInput.value = "";
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if(!response.ok) {
            loadingScreen.classList.remove("active");
            errorContainer.classList.add("active");
            return;
        }

        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(err) {
        //HW    
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
    }
}