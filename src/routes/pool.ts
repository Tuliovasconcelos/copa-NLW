import fastify, { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import ShortUniqueId from 'short-unique-id'
import { z } from 'zod'
import { authenticate } from "../plugins/authenticate";




export async function poolRoutes(fastify: FastifyInstance) {

    //Primeira rota
    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count()

        return { count }
    });

    fastify.post('/pools', async (request, response) => {

        //criando a tipagem da requisição com lib zod
        const createPoolBody = z.object({
            title: z.string(),
        })

        const { title } = createPoolBody.parse(request.body)

        //Criando código aleatório 
        const generate = new ShortUniqueId({
            length: 6
        })

        const code = String(generate()).toUpperCase();

        let ownerId = null;


        //Verificando se a pessoa que criou está autenticada para registrar qual usuário criou
        try {
            await request.jwtVerify()
            await prisma.pool.create({
                data: {
                    title,
                    code: code,
                    ownerId: request.user.sub,
                    Participant: {
                        create: {
                            userId: request.user.sub
                        }
                    }
                }
            })
        } catch {
            await prisma.pool.create({
                data: {
                    title,
                    code: code
                }
            })

        }

        return response.status(201).send({ code })
    });

    fastify.post('/pools/:id/join', {
        onRequest: [authenticate]
    }, async (request, response) => {

        const joinPoolBody = z.object({
            code: z.string(),
        })

        const { code } = joinPoolBody.parse(request.body)

        //verificando se existe bolão cadastrado
        const pool = await prisma.pool.findUnique({
            where: {
                code
            },
        })

        if (!pool) {
            return response.status(400).send({
                message: 'Pool not found'
            })
        }
        //Verificando se possui owner, se n, coloca a primeira pessoa que entra como owner 
        if (!pool.ownerId) {
            await prisma.pool.update({
                where: {
                    id: pool.id,
                },
                data: {
                    ownerId: request.user.sub
                }

            })
        }
        await prisma.participant.create({
            data: {
                poolId: pool.id,
                userId: request.user.sub
            }
        })

        return response.status(201).send()
    })

}