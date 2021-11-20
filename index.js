require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require ('./models/person')

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name = 'CastError') {
    return response.status(400).send({error: 'malformatted id'})
  }
  
  next(error)
}

app.use(express.json())
// app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))

morgan.token('json', (request, response) => {
  return JSON.stringify({
    name: request.body.name,
    number: request.body.number,
  })
}) ;

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :json'
  )
);

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/info', (request, response) => {
  const date = new Date(Date.now());
  Person.find({}).then(persons => {
    response.send(`Phonebook has info for ${persons.length} people. ${date}`);
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
        .then(person => {
         if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
})

app.put('/api/persons/:id', (request,response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {number: body.number})
        .then(updatedNumber => {
          response.json(updatedNumber)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
 Person.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({error: 'name is missing'})
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.use(errorHandler)