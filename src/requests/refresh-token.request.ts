import Joi from '@hapi/joi'
export const RefteshTokenSchema = Joi.object().keys({
    refreshToken: Joi.string().required()
})