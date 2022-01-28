const authRouter = require("express").Router()
const Auth = require('../models/Auth')
const { hashPassword, verifyPassword } = require("../service/Argon2")
const { createToken } = require("../service/Jwt")

authRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body
    
    try {
        const user = await Auth.findByEmail(email)
        if (user) {
            throw new Error("DUPLICATA")
        }
        const hashedPassword = await hashPassword(password)
        await Auth.create(email, hashedPassword)
        return res.status(201).json("user create")
    } catch (error) {
        if (error.message === "DUPLICATA") {
            return res.status(401).json("Email already exist")
        }
            return res.status(500).json(error)
    }
})
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await Auth.findByEmail(email)
        if (!user || user.length < 0) {
            throw new Error("WRONG_CREDENTIALS")
        }
        const verifedPassword = await verifyPassword (user.user_password, password)
        if(!verifedPassword) {
            throw new Error('WRONG_CREDENTIALS')
        } else {
            const access_token = createToken(email, user.id)
            console.log(access_token, 'accessToken')
            return res.status(200).json({ access_token: access_token})
        }
    } catch (error) {
        if(error.message === "WRONG_CREDENTIALS") {
            return res.status(401).json("identifiant ou password incorrect")
        }
        return res.status(500).json("Error server")
    }
})

module.exports = authRouter