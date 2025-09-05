import { useState } from "react"

export const useForm = (initialState, validateFn) => {
    const [fields, setFields] = useState(initialState)
    const [errors, setErrors] = useState({})

    function handleChange({ target }) {
        let { value, name: field, type, checked } = target
        switch (type) {
            case 'number':
            case 'range':
                value = +value
                break
            case 'checkbox':
                value = checked
                break
            default: break
        }
        setFields(prev => ({ ...prev, [field]: value }))

        // בדיקת שגיאות בזמן הקלדה (אם יש פונקציית ולידציה)
        if (validateFn) {
            const validationErrors = validateFn({ ...fields, [field]: value })
            setErrors(validationErrors)
        }
    }

    function resetForm() {
        setFields(initialState)
        setErrors({})
    }

    return {
        fields,
        setFields,
        handleChange,
        resetForm,
        errors
    }
}
