import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
async function main() {
    const user = await prisma.user.create({
        data: {
            nome: 'Jhon Doe',
            email: 'jhondoe@gmail.com.br',
            avatarUrl: 'https://github.com/Tuliovasconcelos.png'
        }
    })

    const pool = await prisma.pool.create({
        data: {
            title: 'Example Poll',
            code: 'BOL123',
            ownerId: user.id,
            Participant: {
                create: {
                    userId: user.id
                }
            }
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-02T12:00:00.050Z',
            firstTeamCountryCode: 'DE',
            secondTeamCountryCode: 'BR'
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-03T12:00:00.050Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'AR',
            guesses: {
                create: {
                    firstTeamPoints: 2,
                    secondTeamPoints: 1,
                    participant: {
                        connect: {
                            userId_poolId: {
                                userId: user.id,
                                poolId: pool.id
                            }
                        }
                    }
                }
            }
        }

    })

}
main()