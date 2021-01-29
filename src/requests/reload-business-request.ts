import Joi from '@hapi/joi'

export const ReloadBusinessParam = Joi.object({
    businessId: Joi.string().required().min(1)
  })