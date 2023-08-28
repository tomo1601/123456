const axios = require('axios');

const getCoordinates = async(address) => {
  const apiKey = process.env.GGMAP_API_KEY; // Replace with your Google Maps API key
  const geocodeApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(geocodeApiUrl);
    console.log(response.data)
    const result = response.data.results[0];
    
    if (result) {
      const location = result.geometry.location;
      return({lat:location.lat, lng: location.lng})
    } else {
      return {lat:10.7965779,lng:106.6301369}
    }
  } catch (error) {
    console.error('Error geocoding address:', error.message);
  }
}

module.exports = {
  getCoordinates
}