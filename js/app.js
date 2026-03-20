// api key de tmdb
const apiKey = "1f2ea493963e95d0e7ff1f8645c28ff3"

// variable para guardar la serie seleccionada
let serieID = null


// funcion para buscar una serie
function buscarSerie(e) {

    // evita que el formulario recargue la pagina
    e.preventDefault()

    // obtiene el valor del input
    const nombre = document.getElementById("serieInput").value.trim()

    // valida que no este vacio
    if (nombre === "") {
        alert("escribe una serie")
        return
    }

    // peticion a la api para buscar series
    fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${nombre}&language=es-ES`)
        .then(res => res.json())
        .then(data => {

            // contenedor donde se muestran los resultados
            const contenedor = document.getElementById("resultados")
            contenedor.innerHTML = ""

            // recorre cada serie encontrada
            data.results.forEach(serie => {

                // valida si tiene imagen
                const img = serie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
                    : "https://via.placeholder.com/500x750"

                // crea la tarjeta de cada serie
                contenedor.innerHTML += `
                <div class="card" onclick="seleccionarSerie(${serie.id})">
                    <img src="${img}">
                    <h3>${serie.name}</h3>
                </div>
                `
            })
        })
}


// funcion para seleccionar una serie
function seleccionarSerie(id) {

    // guarda el id de la serie
    serieID = id

    // carga la informacion por defecto
    infoSerie()
}


// funcion para mostrar la informacion general
function infoSerie() {

    // valida que haya una serie seleccionada
    if (!serieID) return alert("primero selecciona una serie")

    // peticion para obtener datos de la serie
    fetch(`https://api.themoviedb.org/3/tv/${serieID}?api_key=${apiKey}&language=es-ES`)
        .then(res => res.json())
        .then(data => {

            // obtiene imagen del poster
            const poster = data.poster_path
                ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                : ""

            // obtiene imagen de fondo
            const banner = data.backdrop_path
                ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
                : ""

            // inserta la informacion en el html
            document.getElementById("datos").innerHTML = `
            <div class="info-banner" style="background-image:url('${banner}')">
                <div class="info-overlay">
                    <div class="info-container">
                        <img class="info-poster" src="${poster}">
                        <div class="info-text">
                            <h2>${data.name}</h2>
                            <p>${data.overview}</p>
                            <p>⭐ ${data.vote_average}</p>
                            <p>temporadas: ${data.number_of_seasons}</p>
                        </div>
                    </div>
                </div>
            </div>
            `
        })
}


// funcion para mostrar actores
function actores() {

    // valida que haya serie seleccionada
    if (!serieID) return alert("primero selecciona una serie")

    // peticion para obtener el reparto
    fetch(`https://api.themoviedb.org/3/tv/${serieID}/credits?api_key=${apiKey}`)
        .then(res => res.json())
        .then(data => {

            let html = "<h2>actores</h2>"

            // muestra solo los primeros 12 actores
            data.cast.slice(0, 12).forEach(actor => {

                // valida si tiene imagen
                const img = actor.profile_path
                    ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                    : "https://via.placeholder.com/300x450"

                // crea la tarjeta del actor
                html += `
                <div class="actor">
                    <img src="${img}">
                    <h3>${actor.name}</h3>
                    <p>${actor.character}</p>
                </div>
                `
            })

            // inserta en el html
            document.getElementById("datos").innerHTML = html
        })
}


// funcion para mostrar temporadas
function temporadas() {

    // valida que haya serie seleccionada
    if (!serieID) return alert("primero selecciona una serie")

    // peticion para obtener temporadas
    fetch(`https://api.themoviedb.org/3/tv/${serieID}?api_key=${apiKey}&language=es-ES`)
        .then(res => res.json())
        .then(data => {

            let html = "<h2>temporadas</h2>"

            // recorre cada temporada
            data.seasons.forEach(season => {

                // valida si tiene imagen
                const img = season.poster_path
                    ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
                    : "https://via.placeholder.com/500x750"

                // crea tarjeta de temporada
                html += `
                <div class="card">
                    <img src="${img}">
                    <h3>${season.name}</h3>
                    <p>episodios: ${season.episode_count}</p>
                </div>
                `
            })

            // inserta en el html
            document.getElementById("datos").innerHTML = html
        })
}


// funcion para mostrar imagenes
function imagenes() {

    // valida que haya serie seleccionada
    if (!serieID) return alert("primero selecciona una serie")

    // peticion para obtener imagenes
    fetch(`https://api.themoviedb.org/3/tv/${serieID}/images?api_key=${apiKey}`)
        .then(res => res.json())
        .then(data => {

            let html = "<h2>galeria</h2>"

            // muestra solo las primeras 12 imagenes
            data.backdrops.slice(0, 12).forEach(img => {

                html += `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w780${img.file_path}">
                </div>
                `
            })

            // inserta en el html
            document.getElementById("datos").innerHTML = html
        })
}


// funcion para activar el boton seleccionado
function activarBoton(btn) {

    // quita la clase activo de todos los botones
    document.querySelectorAll(".menu button")
        .forEach(b => b.classList.remove("activo"))

    // agrega la clase al boton clickeado
    btn.classList.add("activo")
}