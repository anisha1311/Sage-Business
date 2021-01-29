import Joi from '@hapi/joi';

export const connectionUrlSchema = Joi.object({
    requestType: Joi.number().required().not(null, 'null', 'undefined').valid(1, 2),
    state: Joi.string().optional().not(null, 'null', 'undefined')
});

export const connectUserSchema = Joi.object({
    requestType: Joi.number().required().not(null, 'null', 'undefined').valid(1, 2),
    code: Joi.string().required().not(null, 'null', 'undefined').min(1),
    keepMeLogin: Joi.boolean().optional().allow(null).empty('').default(false),
    state:Joi.string().optional().allow(null).empty('').default('')
});