// api key de tmdb
const apiKey = "1f2ea493963e95d0e7ff1f8645c28ff3"

// variable global donde guardamos el id de la serie
let serieID = null



// funcion para buscar una serie en la api
function buscarSerie() {

    // obtenemos el nombre escrito por el usuario
    const nombre = document.getElementById("serieInput").value

    // validamos que el usuario haya escrito algo
    if (nombre === "") {
        alert("escribe el nombre de una serie")
        return
    }

    // peticion a la api para buscar series
    fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${nombre}&language=es-ES`)

        .then(res => res.json())

        .then(data => {

            const contenedor = document.getElementById("resultados")

            // limpiamos resultados anteriores
            contenedor.innerHTML = ""

            // si no encuentra resultados
            if (data.results.length === 0) {
                contenedor.innerHTML = "<p>no se encontro la serie</p>"
                return
            }

            // recorremos los resultados
            data.results.forEach(serie => {

                // guardamos el id de la serie
                serieID = serie.id

                // verificamos si la serie tiene imagen
                const img = serie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
                    : "https://via.placeholder.com/500x750?text=sin+imagen"

                // mostramos la serie en pantalla
                contenedor.innerHTML += `
<div class="card">
<img src="${img}">
<h3>${serie.name}</h3>
<p>${serie.first_air_date}</p>
</div>
`

            })

        })

        // manejo de error si falla la conexion
        .catch(error => {

            document.getElementById("resultados").innerHTML =
                "<p>error conectando con la api</p>"

        })

}




// funcion que muestra informacion general de la serie
function infoSerie() {

    // validamos que exista una serie seleccionada
    if (!serieID) {
        alert("primero busca una serie")
        return
    }

    // peticion para obtener informacion de la serie
    fetch(`https://api.themoviedb.org/3/tv/${serieID}?api_key=${apiKey}&language=es-ES`)

        .then(res => res.json())

        .then(data => {

            // verificamos imagen poster
            const poster = data.poster_path
                ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                : "https://via.placeholder.com/500x750"

            // verificamos imagen de fondo
            const banner = data.backdrop_path
                ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
                : ""

            // mostramos la informacion
            document.getElementById("datos").innerHTML = `

<div class="info-banner" style="background-image:url('${banner}')">

<div class="info-overlay">

<div class="info-container">

<img class="info-poster" src="${poster}">

<div class="info-text">

<h2>${data.name}</h2>

<p>${data.overview}</p>

<p><strong>rating:</strong> ${data.vote_average}</p>

<p><strong>temporadas:</strong> ${data.number_of_seasons}</p>

<p><strong>episodios:</strong> ${data.number_of_episodes}</p>

</div>
</div>
</div>
</div>

`

        })

        .catch(error => {

            document.getElementById("datos").innerHTML =
                "<p>error cargando informacion</p>"

        })

}




// funcion para mostrar los actores principales
function actores() {

    if (!serieID) {
        alert("primero busca una serie")
        return
    }

    fetch(`https://api.themoviedb.org/3/tv/${serieID}/credits?api_key=${apiKey}&language=es-ES`)

        .then(res => res.json())

        .then(data => {

            let html = ""

            // mostramos solo los primeros 12 actores
            data.cast.slice(0, 12).forEach(actor => {

                // imagen del actor
                const img = actor.profile_path
                    ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                    : "https://via.placeholder.com/300x450"

                // creamos tarjeta del actor
                html += `
<div class="actor">

<img src="${img}">

<h3>${actor.name}</h3>

<p>${actor.character}</p>

</div>
`

            })

            document.getElementById("datos").innerHTML = html

        })

        .catch(error => {

            document.getElementById("datos").innerHTML =
                "<p>error cargando actores</p>"

        })

}




// funcion para mostrar las temporadas
function temporadas() {

    if (!serieID) {
        alert("primero busca una serie")
        return
    }

    fetch(`https://api.themoviedb.org/3/tv/${serieID}?api_key=${apiKey}&language=es-ES`)

        .then(res => res.json())

        .then(data => {

            let html = ""

            // recorremos las temporadas
            data.seasons.forEach(season => {

                // imagen de temporada
                const img = season.poster_path
                    ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
                    : "https://via.placeholder.com/500x750"

                html += `
<div class="card">

<img src="${img}">

<h3>${season.name}</h3>

<p>episodios: ${season.episode_count}</p>

</div>
`

            })

            document.getElementById("datos").innerHTML = html

        })

        .catch(error => {

            document.getElementById("datos").innerHTML =
                "<p>error cargando temporadas</p>"

        })

}




// funcion para mostrar galeria de imagenes
function imagenes() {

    if (!serieID) {
        alert("primero busca una serie")
        return
    }

    fetch(`https://api.themoviedb.org/3/tv/${serieID}/images?api_key=${apiKey}`)

        .then(res => res.json())

        .then(data => {

            let html = ""

            // mostramos solo 12 imagenes
            data.backdrops.slice(0, 12).forEach(img => {

                html += `
<div class="card">

<img src="https://image.tmdb.org/t/p/w780${img.file_path}">

</div>
`

            })

            document.getElementById("datos").innerHTML = html

        })

        .catch(error => {

            document.getElementById("datos").innerHTML =
                "<p>error cargando imagenes</p>"

        })

}




// funcion para mostrar los generos
function generos() {

    fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=es-ES`)

        .then(res => res.json())

        .then(data => {

            let html = ""

            data.genres.forEach(g => {

                html += `
<div class="card">

<h3>${g.name}</h3>

<p>id: ${g.id}</p>

</div>
`

            })

            document.getElementById("datos").innerHTML = html

        })

        .catch(error => {

            document.getElementById("datos").innerHTML =
                "<p>error cargando generos</p>"

        })

}




// funcion que muestra recomendaciones de series similares
function recomendaciones() {

    if (!serieID) {
        alert("primero busca una serie")
        return
    }

    fetch(`https://api.themoviedb.org/3/tv/${serieID}/recommendations?api_key=${apiKey}&language=es-ES`)

        .then(res => res.json())

        .then(data => {

            let html = ""

            // mostramos 10 recomendaciones
            data.results.slice(0, 10).forEach(serie => {

                // imagen de la serie
                const img = serie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
                    : "https://via.placeholder.com/500x750"

                html += `
<div class="card">

<img src="${img}">

<h3>${serie.name}</h3>

</div>
`

            })

            document.getElementById("datos").innerHTML = html

        })

        .catch(error => {

            document.getElementById("datos").innerHTML =
                "<p>error cargando recomendaciones</p>"

        })

}