document.getElementById('countryInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    searchCountry();
  }
});

document.getElementById('countryInput').addEventListener('focus', function() {
  document.querySelector('.search-bar').classList.add('active');
});

document.getElementById('countryInput').addEventListener('blur', function() {
  document.querySelector('.search-bar').classList.remove('active');
});

function searchCountry() {
  var countryName = document.getElementById('countryInput').value;
  var result = document.getElementById('result');
  result.innerHTML = '';
  
  result.innerHTML = '<div class="loading">Searching for country data...</div>';

  var API_KEY = "aff6cae3afff3956755af2384edf980a";
  
  fetch(`https://restcountries.com/v3.1/name/${countryName}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Country not found');
      }
      return response.json();
    })
    .then(countryData => {
      var country = countryData[0];
      var capital = country.capital[0];
      
      return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${API_KEY}&units=metric`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Weather data not available');
          }
          return response.json();
        })
        .then(weather => {
          result.innerHTML = '';
          displayCountryWeather(country, capital, weather, result);
        });
    })
    .catch(error => {
      result.innerHTML = '<p class="error-message fade-in">' + error.message + '. Please try again.</p>';
      console.error(error);
    });
}
