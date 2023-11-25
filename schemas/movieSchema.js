// para validaciones instalmos zod con npm i zod -E
const z = require('zod')

const movieSchema = z.object({
  title: z.string().min(3).max(50),
  genre: z.array(z.enum(['Action', 'Comedy', 'Crime', 'Romance', 'Drama', 'Horror', 'Adventure', 'Biography', 'Sci-Fi', 'Fantasy']),
    {
      invalid_type_error: 'las palabras claves son Action,Comedy, Drama, Horror, Sci-Fi '
    }).min(1).max(4),
  year: z.number().int().min(1900).max(2023),
  director: z.string().min(3).max(50),
  duration: z.number().positive().max(300),
  rate: z.number().positive().max(10).default(0),
  poster: z.string().url()

})

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}

function validateMovie (input) {
  return movieSchema.safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
