import joi from 'joi'

const validateCreateProperty = (obj : any) => {

    const schema = joi.object({
        title : joi.string().min(5).max(50).messages({
            'string.min': "Title must be at least 5 characters",
            'string.max': "Title cannot exceed 50 characters"
        }),

        status: joi.string().valid("rent", "sell").messages({ 
            'any.only': "Please select a valid property type" 
        }),
        
    price: joi.number().min(0).messages({ 
        'number.min': "Price must be a positive number" 
    }),
    category: joi.string().min(1).messages({ 
        'string.min': "Category is required" 
    }),
    description: joi.string().min(10).max(500).messages({ 
        'string.min': "Description must be at least 10 characters", 
        'string.max': "Description cannot exceed 500 characters" 
    }),
    longitude: joi.number(),
    latitude: joi.number(),
    wilaya: joi.number().min(1).messages({ 
        'number.min': "Wilaya is required" 
    }),
    commune: joi.string().min(1).messages({ 
        'string.min': "Commune is required" 
    }),
    quartier: joi.string().min(1).messages({ 
        'string.min': "Quartier is required" 
    }),
    guests: joi.number().min(1).messages({ 
        'number.min': "Area must be greater than 0" 
    }),
    bedrooms: joi.number().min(0).messages({ 
        'number.min': "Bedrooms cannot be negative" 
    }),
    bathrooms: joi.number().min(0).messages({ 
        'number.min': "Bathrooms cannot be negative" 
    }),
    
    files: joi.array().items(joi.object().instance(File)).optional(),
})

return schema.validate(obj)
} 

export { validateCreateProperty }