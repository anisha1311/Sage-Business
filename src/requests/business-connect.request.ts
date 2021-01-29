import Joi from '@hapi/joi'
export const ConnectBusinessSchema = Joi.object().keys({
    code: Joi.string().required(),
    // userId: Joi.string().required(),
    // timezone:Joi.string().required()
})