import fastify, { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";


export async function userRoutes(fastify: FastifyInstance) {

    //Contagem users
    fastify.get('/users/count', async () => {
        const count = await prisma.user.count()

        return { count }
    });

}