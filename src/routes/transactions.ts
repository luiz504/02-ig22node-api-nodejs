import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select()

    return {
      transactions,
    }
  })
  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({ id: z.string().uuid() })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first()

    return {
      transaction,
    }
  })
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z
        .string({ required_error: 'Transaction title is required.' })
        .min(1, 'Transaction title should have at least 1 character.'),
      amount: z.number().min(0),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send()
  })
}