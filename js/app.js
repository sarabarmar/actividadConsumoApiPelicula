const apiKey = "1f2ea493963e95d0e7ff1f8645c28ff3";

let serieID = null;

function buscarSerie(){

const nombre = document.getElementById("serieInput").value;

fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${nombre}&language=es-ES`)
.then(res => res.json())
.then(data => {

const contenedor = document.getElementById("resultados");

contenedor.innerHTML = "";

data.results.forEach(serie => {

serieID = serie.id;

contenedor.innerHTML += `

<div class="card">

<img src="https://image.tmdb.org/t/p/w500${serie.poster_path}">

<h3>${serie.name}</h3>

<p>${serie.first_air_date}</p>

</div>

`;

});

});

}
function infoSerie(){

fetch(`https://api.themoviedb.org/3/tv/${serieID}?api_key=${apiKey}&language=es-ES`)
.then(res => res.json())
.then(data => {

const poster = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
const banner = `https://image.tmdb.org/t/p/original${data.backdrop_path}`;

document.getElementById("datos").innerHTML = `

<div class="info-banner" style="background-image:url('${banner}')">

<div class="info-overlay">

<div class="info-container">

<img class="info-poster" src="${poster}">

<div class="info-text">

<h2>${data.name}</h2>

<p>${data.overview}</p>

<p><strong>⭐ Rating:</strong> ${data.vote_average}</p>

<p><strong>📺 Temporadas:</strong> ${data.number_of_seasons}</p>

<p><strong>🎬 Episodios:</strong> ${data.number_of_episodes}</p>

</div>

</div>

</div>

</div>

`;

});

}
function actores(){

fetch(`https://api.themoviedb.org/3/tv/${serieID}/credits?api_key=${apiKey}&language=es-ES`)
.then(res => res.json())
.then(data => {

let html = "";

data.cast.slice(0,12).forEach(actor => {

const img = actor.profile_path 
? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
: "";

html += `

<div class="actor">

<img src="${img}">

<h3>${actor.name}</h3>

<p>${actor.character}</p>

</div>

`;

});

document.getElementById("datos").innerHTML = html;

});

}
function temporadas(){

fetch(`https://api.themoviedb.org/3/tv/${serieID}?api_key=${apiKey}&language=es-ES`)
.then(res => res.json())
.then(data => {

let html = "";

data.seasons.forEach(season => {

const img = season.poster_path 
? `https://image.tmdb.org/t/p/w500${season.poster_path}`
: "";

html += `

<div class="card">

<img src="${img}">

<h3>${season.name}</h3>

<p>Episodios: ${season.episode_count}</p>

</div>

`;

});

document.getElementById("datos").innerHTML = html;

});

}
function recomendaciones(){

fetch(`https://api.themoviedb.org/3/tv/${serieID}/recommendations?api_key=${apiKey}&language=es-ES`)
.then(res => res.json())
.then(data => {

let html = "";

data.results.slice(0,10).forEach(serie => {

const img = serie.poster_path
? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
: "";

html += `

<div class="card">

<img src="${img}">

<h3>${serie.name}</h3>

</div>

`;

});

document.getElementById("datos").innerHTML = html;

});

}