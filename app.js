const express = require('express') // instalar express con npm xpress -E
const movies = require('./movies.json')
const products = require('./products.json')
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./schemas/movieSchema')
const cors = require('cors')

const app = express()
app.disable('x-powered-by')

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGIN = [
      'http://127.0.0.1:5500',
      'http://localhost:3000',
      'http://movies.com',
      'http://localhost:5173'
    ]
    if (ACCEPTED_ORIGIN.includes(origin)) return callback(null, origin)

    if (!origin) return callback(null, origin)

    callback(new Error('Not allowed by CORS'))
  }
}))

app.use(express.json())

app.get('/products', (req, res) => {
  res.json(products)
})

// const ACCEPTED_ORIGIN = [
//   'http://127.0.0.1:5500',
//   'http://localhost:3000',
//   'http://movies.com'
// ]

// buscar pelicula por genero por query
app.get('/movies', (req, res) => {
  // const origin = req.headers.origin
  // if (ACCEPTED_ORIGIN.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) {
    res.json(movie)
  } else {
    res.status(404).json({ message: 'Not found' })
  }
})

app.post('/movies', (req, res) => {
  const validate = validateMovie(req.body)
  if (validate.error) {
    return res.status(400).json(JSON.parse(validate.error.message))
  }
  // esto lo aremos en base de datos
  const newMovie = {
    id: crypto.randomUUID(), // <--- uuid v4
    ...validate.data
  }
  // esto no seria rest porque
  // estamos guardando la aplicacion en memoria
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

// actulizar una parte de la pelicula por id
app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Not found' })
  }

  const validate = validatePartialMovie(req.body)
  if (validate.error) return res.status(400).json(JSON.parse(validate.error.message))

  const updatedMovie = {
    ...movies[movieIndex],
    ...validate.data
  }
  /* sen in data base -> */ movies[movieIndex] = updatedMovie
  res.json(updatedMovie)
})

// borrar pelicula por id
app.delete('/movies/:id', (req, res) => {
  // const origin = req.headers.origin
  // if (ACCEPTED_ORIGIN.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Not found' })
  }

  movies.splice(movieIndex, 1)
  res.status(204).json({ message: 'movie Delete' })
})

// manejo de los cors

// app.options('/movies/:id', (req, res) => {
//   const origin = req.headers.origin
//   if (ACCEPTED_ORIGIN.includes(origin)) {
//     res.header('Access-Control-Allow-Origin', origin)
//   }
//   res.header('Access-Control-Allow-Methods', 'GET, POST,PUT, PATCH, DELETE')
//   res.status(204).end()
// })

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})
const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})
