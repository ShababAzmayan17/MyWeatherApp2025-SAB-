
// Store recent searches and favorites
let recentSearches = [];
let favorites = [];

// Check for saved data in localStorage
window.addEventListener('DOMContentLoaded', function() {
  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-toggle').textContent = '☀️';
  }
  
  // Load recent searches
  const savedSearches = localStorage.getItem('recentSearches');
  if (savedSearches) {
    recentSearches = JSON.parse(savedSearches);
    updateRecentSearches();
  }
  
  // Load favorites
  const savedFavorites = localStorage.getItem('favorites');
  if (savedFavorites) {
    favorites = JSON.parse(savedFavorites);
  }
  
  // Add event listeners
  document.getElementById('countryInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      searchCountry();
    }
  });
  
  // Focus animation for search input
  document.getElementById('countryInput').addEventListener('focus', function() {
    document.querySelector('.search-bar').classList.add('active');
  });
  
  document.getElementById('countryInput').addEventListener('blur', function() {
    document.querySelector('.search-bar').classList.remove('active');
  });
  
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
});

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  document.getElementById('theme-toggle').textContent = isDarkMode ? '☀️' : '🌙';
}

function addToRecentSearches(countryName) {
  // Add to recent searches if not already present
  if (!recentSearches.includes(countryName)) {
    recentSearches.unshift(countryName);
    // Keep only the 5 most recent
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    // Update UI
    updateRecentSearches();
  }
}

function updateRecentSearches() {
  const recentContainer = document.getElementById('recent-searches');
  if (!recentContainer) return;
  
  recentContainer.innerHTML = '<p><strong>Recent Searches:</strong></p>';
  
  recentSearches.forEach(country => {
    const item = document.createElement('span');
    item.className = 'recent-item';
    item.textContent = country;
    item.addEventListener('click', function() {
      document.getElementById('countryInput').value = country;
      searchCountry();
    });
    recentContainer.appendChild(item);
  });
}

function searchCountry() {
  var countryName = document.getElementById('countryInput').value;
  if (!countryName.trim()) {
    showError("Please enter a country name");
    return;
  }
  
  var result = document.getElementById('result');
  
  // Show loading animation
  result.innerHTML = '<div class="loading">Searching for country data...</div>';
  
  // Add to recent searches
  addToRecentSearches(countryName);
  
  // Clear the search input field after initiating the search
  document.getElementById('countryInput').value = '';
  
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
      var capital = country.capital && country.capital.length > 0 ? country.capital[0] : null;
      
      if (!capital) {
        throw new Error('No capital city found for this country');
      }
      
      return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${API_KEY}&units=metric`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Weather data not available');
          }
          return response.json();
        })
        .then(weather => {
          // Clear loading animation
          result.innerHTML = '';
          displayCountryWeather(country, capital, weather, result);
        });
    })
    .catch(error => {
      showError(error.message + '. Please try again.');
      console.error(error);
    });
}

function showError(message) {
  var result = document.getElementById('result');
  result.innerHTML = `<div class="error-message fade-in">${message}</div>`;
}

function getWeatherIcon(weatherCode) {
  // Simple weather icon mapping
  const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'default': '🌡️'
  };
  
  return weatherIcons[weatherCode] || weatherIcons.default;
}

function addToFavorites(countryName) {
  if (!favorites.includes(countryName)) {
    favorites.push(countryName);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification(`${countryName} added to favorites!`);
  } else {
    // Remove from favorites
    favorites = favorites.filter(c => c !== countryName);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification(`${countryName} removed from favorites`);
  }
  
  // Update button text
  const favoriteBtn = document.getElementById('favorite-btn');
  if (favoriteBtn) {
    favoriteBtn.textContent = favorites.includes(countryName) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites';
  }
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.background = '#fc7bb5';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '1000';
  notification.style.animation = 'slideUp 0.3s ease-out forwards';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'fadeIn 0.3s ease-out reverse forwards';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function displayCountryWeather(country, capital, weather, result) {
  var card = document.createElement('div');
  card.className = 'card slide-up';
  card.id = 'country-card';
  
  // Get weather icon
  var weatherIcon = getWeatherIcon(weather.weather[0].main);
  
  // Format sunrise and sunset
  const sunrise = new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const sunset = new Date(weather.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  // Check if country is in favorites
  const isFavorite = favorites.includes(country.name.common);
  
  card.innerHTML = `
    <div class="grid">
      <div style="width: 100%;">
        <h2>${country.name.common}</h2>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Weather:</strong> <span class="weather-icon">${weatherIcon}</span> ${weather.weather[0].description}</p>
        
        <div class="weather-details">
          <div class="weather-detail-item">
            <div>Temperature</div>
            <div class="weather-detail-value">${weather.main.temp}°C</div>
          </div>
          <div class="weather-detail-item">
            <div>Humidity</div>
            <div class="weather-detail-value">${weather.main.humidity}%</div>
          </div>
          <div class="weather-detail-item">
            <div>Wind</div>
            <div class="weather-detail-value">${weather.wind.speed} m/s</div>
          </div>
          <div class="weather-detail-item">
            <div>Sunrise</div>
            <div class="weather-detail-value tooltip" data-tooltip="Local time">${sunrise}</div>
          </div>
          <div class="weather-detail-item">
            <div>Sunset</div>
            <div class="weather-detail-value tooltip" data-tooltip="Local time">${sunset}</div>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <button onclick="showDetails('${country.name.common}', '${country.flags.png}', ${country.population}, '${country.subregion || 'N/A'}', '${Object.values(country.languages || {}).join(', ') || 'N/A'}')">More Details</button>
          <button class="favorite-button" id="favorite-btn" onclick="addToFavorites('${country.name.common}')">${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}</button>
        </div>
      </div>
    </div>
  `;
  
  result.appendChild(card);
  
  // Apply staggered animation to the elements
  setTimeout(() => {
    card.style.opacity = "1";
  }, 100);
}

function shareCountry(countryName) {
  if (navigator.share) {
    navigator.share({
      title: `Weather in ${countryName}`,
      text: `Check out the weather in ${countryName} on the Country Weather App!`,
      url: window.location.href
    })
    .then(() => showNotification('Shared successfully!'))
    .catch((error) => showNotification('Error sharing'));
  } else {
    // Fallback for browsers that don't support share API
    try {
      navigator.clipboard.writeText(window.location.href);
      showNotification('Link copied to clipboard!');
    } catch (err) {
      showNotification('Unable to share');
    }
  }
}

function showDetails(name, flagUrl, population, subregion, languages) {
  var existingDetails = document.getElementById('details-card');
  if (existingDetails) {
    existingDetails.classList.add('fade-out');
    setTimeout(() => {
      existingDetails.remove();
      createDetailsCard();
    }, 300);
  } else {
    createDetailsCard();
  }
  
  function createDetailsCard() {
    var result = document.getElementById('result');
    var detailCard = document.createElement('div');
    detailCard.className = 'card fade-in-card';
    detailCard.id = 'details-card';
    
    detailCard.innerHTML = `
      <div class="grid">
        <img src="${flagUrl}" class="flag" alt="Flag of ${name}">
        <div>
          <h2>Details for ${name}</h2>
          <p><strong>Population:</strong> ${population.toLocaleString()}</p>
          <p><strong>Subregion:</strong> ${subregion}</p>
          <p><strong>Languages:</strong> ${languages}</p>
          <button class="share-button" onclick="shareCountry('${name}')">📤 Share</button>
        </div>
      </div>
    `;
    
    result.appendChild(detailCard);
    
    // Apply entrance animation
    setTimeout(() => {
      detailCard.style.opacity = "1";
    }, 50);
  }
}

// Add animation to policy sections
    document.addEventListener('DOMContentLoaded', function() {
      const sections = document.querySelectorAll('.policy-section');
      sections.forEach(section => {
        setTimeout(() => {
          section.style.opacity = "1";
        }, 100);
      });
    });

 // Dark mode functionality for about page
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check if dark mode was previously enabled
    if(localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    // Toggle dark mode
    themeToggle.addEventListener('click', function() {
        if(document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            themeToggle.textContent = '🌙';
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            themeToggle.textContent = '☀️';
        }
    });

    // Animation for about page sections
    const aboutSections = document.querySelectorAll('.about-section');
    
    // Function to check if an element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Function to handle scroll animation
    function handleScroll() {
        aboutSections.forEach(section => {
            if (isInViewport(section)) {
                section.classList.add('visible');
            }
        });
    }
    
    // Initial check on page load
    handleScroll();
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
});

// Add animation to about sections
 // Add animation on scroll
    document.addEventListener('DOMContentLoaded', function() {
      const sections = document.querySelectorAll('.about-section');
      
      function checkVisibility() {
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;
          
          if (rect.top <= windowHeight * 0.8) {
            section.classList.add('visible');
          }
        });
      }
      
      // Initial check
      checkVisibility();
      
      // Check on scroll
      window.addEventListener('scroll', checkVisibility);
      
      // Animated counter
      function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCount() {
          start += increment;
          if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCount);
          } else {
            element.textContent = target + '+';
          }
        }
        
        updateCount();
      }
      
      // Start animations when elements are visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'countries-count') {
              animateCounter(entry.target, 195);
            } else if (entry.target.id === 'users-count') {
              animateCounter(entry.target, 50);
            } else if (entry.target.id === 'searches-count') {
              animateCounter(entry.target, 1);
            }
          }
        });
      }, { threshold: 0.5 });
      
      // Observe the counter elements
      document.querySelectorAll('.stat-number').forEach(counter => {
        observer.observe(counter);
      });
    });

// Dark mode functionality for about page
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check if dark mode was previously enabled
    if(localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    // Toggle dark mode
    themeToggle.addEventListener('click', function() {
        if(document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            themeToggle.textContent = '🌙';
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            themeToggle.textContent = '☀️';
        }
    });

    // Animation for about page sections
    const aboutSections = document.querySelectorAll('.about-section');
    
    // Function to check if an element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Function to handle scroll animation
    function handleScroll() {
        aboutSections.forEach(section => {
            if (isInViewport(section)) {
                section.classList.add('visible');
            }
        });
    }
    
    // Initial check on page load
    handleScroll();
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
});

// add animation to contact sections
// FAQ Accordion functionality
    document.addEventListener('DOMContentLoaded', function() {
      // Add animation to contact sections
      const sections = document.querySelectorAll('.contact-section');
      
      function checkVisibility() {
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;
          
          if (rect.top <= windowHeight * 0.8) {
            setTimeout(() => {
              section.classList.add('visible');
            }, index * 100);
          }
        });
      }
      
      // Initial check
      checkVisibility();
      
      // Check on scroll
      window.addEventListener('scroll', checkVisibility);
      
      // FAQ accordion
      const faqQuestions = document.querySelectorAll('.faq-question');
      
      faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
          const answer = question.nextElementSibling;
          const isOpen = question.classList.contains('active');
          
          // Close all FAQs
          document.querySelectorAll('.faq-question').forEach(q => {
            q.classList.remove('active');
            q.nextElementSibling.style.maxHeight = '0';
          });
          
          // Open the clicked one if it was closed
          if (!isOpen) {
            question.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
        });
      });
      
      // Form submission handling
      const contactForm = document.getElementById('contact-form');
      const formStatus = document.getElementById('form-status');
      
      if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Simulate form submission
          formStatus.textContent = 'Sending...';
          formStatus.className = 'form-status sending';
          
          // Simulate API call with timeout
          setTimeout(() => {
            formStatus.textContent = 'Message sent successfully! We\'ll get back to you soon.';
            formStatus.className = 'form-status success';
            contactForm.reset();
          }, 1500);
        });
      }
      
      // Newsletter subscription
      const newsletterSubmit = document.getElementById('newsletter-submit');
      
      if (newsletterSubmit) {
        newsletterSubmit.addEventListener('click', function() {
          const emailInput = document.getElementById('newsletter-email');
          
          if (emailInput.value && emailInput.checkValidity()) {
            showNotification('Thanks for subscribing to our newsletter!');
            emailInput.value = '';
          } else {
            showNotification('Please enter a valid email address', true);
          }
        });
      }
    });
    
    // Notification function (reusing from weather.js)
    function showNotification(message, isError = false) {
      // Create notification element
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.background = isError ? '#ff3a5e' : '#fc7bb5';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '5px';
      notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      notification.style.zIndex = '1000';
      notification.style.animation = 'slideUp 0.3s ease-out forwards';
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.animation = 'fadeIn 0.3s ease-out reverse forwards';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 3000);
    }
  
// Dark mode functionality for about page
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check if dark mode was previously enabled
    if(localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    // Toggle dark mode
    themeToggle.addEventListener('click', function() {
        if(document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            themeToggle.textContent = '🌙';
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            themeToggle.textContent = '☀️';
        }
    });

    // Animation for about page sections
    const aboutSections = document.querySelectorAll('.about-section');
    
    // Function to check if an element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Function to handle scroll animation
    function handleScroll() {
        aboutSections.forEach(section => {
            if (isInViewport(section)) {
                section.classList.add('visible');
            }
        });
    }
    
    // Initial check on page load
    handleScroll();
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
});