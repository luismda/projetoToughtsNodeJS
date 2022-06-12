const Tought = require('../models/Tought')
const User = require('../models/User')
const { Op } = require('sequelize')

class ToughtsController {
    static async showToughts(req, res) {
        let search = ''
        let order = 'DESC'

        if (req.query.search) {
            search = req.query.search
        }

        if (req.query.order === 'old') {
            order = 'ASC'
        }

        const toughtsData = await Tought.findAll({ 
            include: User,
            where: {
                title: { [Op.like]: `%${search}%` }
            },
            order: [['createdAt', order]]
        })

        const toughts = toughtsData.map(item => item.get({ plain: true }))

        let toughtsQty = toughts.length

        if (toughtsQty === 0) {
            toughtsQty = false
        }

        res.render('toughts/home', { toughts, search, toughtsQty })
    }

    static async dashboard(req, res) {
        const userId = req.session.userId

        const user = await User.findOne({ where: { id: userId }, include: Tought, plain: true})

        if (!user) {
            res.redirect('/login')
            return
        }

        const toughts = user.Toughts.map(tought => tought.dataValues)

        let emptyToughts = toughts.length === 0 ? true : false

        res.render('toughts/dashboard', { toughts, emptyToughts })
    }

    static createTought(req, res) {
        res.render('toughts/create')
    }

    static async createToughtSave(req, res) {
        const tought = {
            title: req.body.title,
            UserId: req.session.userId
        }

        try {
            await Tought.create(tought)

            req.flash('message', 'Pensamento criado com sucesso!')

            req.session.save(() => res.redirect('/toughts/dashboard'))
        } catch (error) {
            console.log(error)
        }
    }

    static async removeTought(req, res) {
        const id = req.body.id
        const userId = req.session.userId

        try {
            await Tought.destroy({ where: { id: id, UserId: userId } })

            req.flash('message', 'Pensamento deletado com sucesso!')

            req.session.save(() => res.redirect('/toughts/dashboard'))
        } catch (error) {
            console.log(error)
        }
    }

    static async updateTought(req, res) {
        const id = req.params.id
        const userId = req.session.userId

        const tought = await Tought.findOne({ where: { id: id, UserId: userId }, raw: true })

        res.render('toughts/edit', { tought })
    }

    static async updateToughtSave(req, res) {
        const id = req.body.id
        const userId = req.session.userId

        const tought = { title: req.body.title }

        try {
            await Tought.update(tought, { where: { id: id, UserId: userId } })

            req.flash('message', 'Pensamento atualizado com sucesso!')

            req.session.save(() => res.redirect('/toughts/dashboard'))
        } catch (error) {
            console.log(error)
        }
        
    }
}

module.exports = ToughtsController