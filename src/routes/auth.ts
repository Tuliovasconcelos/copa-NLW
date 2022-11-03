import fastify, { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function authRoutes(fastify: FastifyInstance) {

    //verifica se o usuário está logado através do JWT
    fastify.get('/me', {
        onRequest: [authenticate]
    }, async (request) => {
        return { user: request.user }
    })

    fastify.post('/users', async (request) => {

        const createUserBody = z.object({
            acess_token: z.string(),
        })

        const { acess_token } = createUserBody.parse(request.body)

        //fazendo autenticação com o google
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                Autorization: `Bearer ${acess_token}`
            }
        })

        const userData = await userResponse.json()

        const userInfoSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string(),
            picture: z.string().url()
        })

        //validando retorno do google
        const userInfo = userInfoSchema.parse(userData)

        //verificado se já existe usuário cadastrado na base de dados com id google
        let user = await prisma.user.findUnique({
            where: {
                googleId: userInfo.id,
            }
        })

        //criando o usuário se ele não estiver cadastrado
        if (!user) {
            user = await prisma.user.create({
                data: {
                    googleId: userInfo.id,
                    nome: userInfo.name,
                    email: userInfo.email,
                    avatarUrl: userInfo.picture
                }
            })
        }

        //criando o token
        const token = fastify.jwt.sign({
            name: user.nome,
            avatarUrl: user.avatarUrl,
        }, {
            sub: user.id,
            expiresIn: '7 days',
        })

        return { token }


    })




}