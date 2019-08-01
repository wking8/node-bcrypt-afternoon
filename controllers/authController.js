const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        const { username, password, isAdmin } = req.body
        const db = req.app.get('db')
        // Use brackets for the sql return if the file has dollar signs and curly if stored as javascript expression
        const result = await db.get_user([username])
        const existingUser = result[0]
        // seeing is username exists
        if (existingUser) {
            return res.status(409).send({ message: 'Username taken' })
        } else {
            // hash n salt dat shit
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)
            const registeredUser = await db.register_user([isAdmin, username, hash])
            const user = registeredUser[0]
            req.session.user = {
                isAdmin: user.is_admin,
                id: user.id,
                username: user.username
            }
        }
        res.status(201).send(req.session.user)
    },
    login: async (req, res) => {
        const { username, password } = req.body
        const db = req.app.get('db')
        const foundUser = await db.get_user([username])
        const user = foundUser[0]
        if (!user) {
            return res.status(401).send('User not found. Please register as a new user before logging in.')
        } else {
            const isAuthenticated = bcrypt.compareSync(password, user.hash);
            if (isAuthenticated === false) {
                return res.status(403).send('Incorrect password')
            } else {
                req.session.user = {
                    isAdmin: user.is_admin,
                    id: user.id,
                    username: user.username
                }
            }
        }
        res.status(200).send(req.session.user)
    }
}