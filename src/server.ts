import Fastify from "fastify";
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { poolRoutes } from "./routes/pool";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/user";
import { guessRoutes } from "./routes/guess";
import { gameRoutes } from "./routes/game";




async function start() {
    const fastify = Fastify({
        //monitora o estado da aplicação 
        logger: true
    });

    //definindo permissões para acesso ao backend
    await fastify.register(cors, {
        origin: true
    });

    //criando secret para gerar token
    await fastify.register(jwt, {
        secret: 'nlwcopa'
    })
    //importando as rotas
    await fastify.register(poolRoutes)
    await fastify.register(authRoutes)
    await fastify.register(userRoutes)
    await fastify.register(guessRoutes)
    await fastify.register(gameRoutes)



    await fastify.listen({ port: 3333, host: '0.0.0.0' });
}

start()