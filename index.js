const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const conn = require('./db/conn')

const Tought = require('./models/Tought')
const User = require('./models/User')

const ToughtsController = require('./controllers/ToughtsController')

const toughtRoutes = require('./routes/toughtRoutes')
const authRoutes = require('./routes/authRoutes')

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())

app.use(express.static('public'))

app.use(
    session({
        name: 'session',
        secret: 'nosso_secret',
        resave: false,
        saveUninitialized: false,
        store: new FileStore({
            logFn: function() {},
            path: require('path').join(require('os').tmpdir(), 'sessions')
        }),
        cookie: {
            secure: false,
            maxAge: 3600000,
            expires: new Date(Date.now() + 3600000),
            httpOnly: true
        }
    })
)

app.use(flash())

app.use((req, res, next) => {
    if (req.session.userId) {
        res.locals.session = req.session
    }

    next()
})

app.use('/', authRoutes)

app.use('/toughts', toughtRoutes)

app.get('/', ToughtsController.showToughts)

conn.sync()
    .then(() => app.listen(3000))
    .catch(err => console.log(err))