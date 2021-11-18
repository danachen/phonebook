const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
app.use(express.json())
// app.use(morgan('tiny'))
app.use(cors())

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

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
  response.json(persons)
})

app.get('/api/info', (request, response) => {
  const date = new Date(Date.now());
  response.send(`Phonebook has info for ${persons.length} people. ${date}`);
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id)

  if (!person) {
    response.status(404).end()
  } else {  
    response.json(person)
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

const nameDuplicate = (newName) => {
  return persons.some(person => person.name === newName)
}

app.post('/api/persons', (request, response) => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(person => person.id)) : 0
  const person = request.body

  if (nameDuplicate(person.name)) {
    return response.status(400).json({ error: 'name must be unique' })
  } else if (!person.number) {
    return response.status(400).json({ error: 'no number is entered'})
  } else {
    person.id = maxId + 1
  }

  persons = persons.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})