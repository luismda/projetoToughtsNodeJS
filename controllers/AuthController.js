const User = require('../models/User')

const bcrypt = require('bcryptjs')

class AuthController {
    static login(req, res) {
        res.render('auth/login')
    }

    static async loginPost(req, res) {
        const { email, password } = req.body

        const user = await User.findOne({ where: { email: email } })

        if (!user) {
            req.flash('message', 'E-mail ou senha incorretos!')
            res.render('auth/login')

            return
        }

        const passwordMatch = bcrypt.compareSync(password, user.password)

        if (!passwordMatch) {
            req.flash('message', 'E-mail ou senha incorretos!')
            res.render('auth/login')

            return
        }

        req.session.userId = user.id

        req.session.save(() => res.redirect('/'))
    }

    static register(req, res) {
        res.render('auth/register')
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmpassword } = req.body

        if (password !== confirmpassword) {
            req.flash('message', 'As senhas estão diferentes! Tente novamente.')
            res.render('auth/register')

            return
        }

        const checkIfUserExists = await User.findOne({ where: { email: email } })

        if (checkIfUserExists) {
            req.flash('message', 'Esse e-mail já está em uso!')
            res.render('auth/register')

            return
        }

        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        const user = {
            name, 
            email,
            password: hashedPassword
        }

        try {
            const createdUser = await User.create(user)

            req.session.userId = createdUser.id

            req.flash('message', 'Cadastro realizado com sucesso!')

            req.session.save(() => res.redirect('/'))
        } catch (error) {
            console.log(error)
        }
    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }
}

module.exports = AuthController