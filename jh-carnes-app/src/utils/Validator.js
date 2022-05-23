export default class Validator {

    rules = [];
    notPass = null;

    /**
     * Evalúa sobre el String dado, todas las reglas definidas previamente en este objeto.
     * @param evaluate String a evaluar.
     * @return true: si pasa la validación,
     *         false: si no pasa la validación.
     */
    validate(evaluate: string): boolean {
        for (let i=0; i<this.rules.length; i++) {
            const rule = this.rules[i];
            if ( !rule.validate( evaluate ) ) {
                if (this.notPass) this.notPass( rule.message );
                return false;
            }
        }
        return true;
    }

    /**
     * Evalúa que ambos String pasado como parámetros coincidan, de ser este el caso se procede a evaluar todas las
     * reglas definidas previamente en este objeto.
     * <br><br>
     * <b>Nota:</b> se recomienda definir el mensaje de error en caso que los String no coincidan, utilizando el método
     * {@link #match(String message)} al momento de definir el Objeto Validator.
     * @param evaluate String a evaluar.
     * @param compare String a comparar.
     * @return true: si pasa la validación, <br>
     *         false: si no pasa la validación.
     */
    compare(evaluate: string, compare: string): boolean {
        const math = evaluate === compare;
        if (!math) {
            if (this.notPass) this.notPass( this.notMathMessage || "" );
            return false;
        }
        return this.validate(evaluate);
    }

    /**
     * Método que permite agregar reglas personalizadas.
     * <br><br>
     * <b>Ejemplo:</b><br>
     * <code>
     * <pre>
     * new Validator()
     *     .rule( evaluate -> {
     *         return evaluate.equals("ejemplo");
     *     },
     *     "El texto es diferente de ejemplo");
     * </pre>
     * </code>
     *
     * @param validate Expresión lambda con la cóndicion a cumplir el String a evaluar para ser considerado valido.
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    rule(validate, message: string): Validator {
        this.rules.push( { validate, message } );
        return this;
    }

    /**
     * Define el mensaje de error en caso de fallar la validación "compare" que compara el String a evaluar con otro.
     * @param message Mensaje de error en caso de fallar la validación match.
     * @return Validator.
     */
    match(message: string): Validator {
        this.notMathMessage = message;
        return this;
    }

    // REGLAS DE LONGITUD //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Verifica que el String a evaluar sea diferente de un String vaciío o de null.
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    notEmpty(message: string): Validator {
        const validate = evaluate => !!evaluate;
        return this.rule(validate, message);
    }

    /**
     * Verifica que el String a evaluar tenga una longitud exacta de caracteres a la condición dada.
     * @param condition longitud de caracteres que debe tener el String a evaluar.
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    length(condition: number, message: string): Validator {
        message = message.replace("%x", condition);
        const validate = evaluate => evaluate.length===condition;
        return this.rule(validate, message);
    }

    /**
     * Verifica que el String a evaluar tenga una longitud de caracteres minima a la condición dada.
     * @param condition Longitud de caracteres minima a cumplir el String a evaluar.
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    minLength(condition: number, message: string) : Validator {
        message = message.replace("%x", condition);
        const validate = evaluate => evaluate.length>=condition;
        return this.rule(validate, message);
    }

    /**
     * Verifica que el String a evaluar tenga una longitud maxima de caracteres a la condición dada.
     * @param condition longitud maxima de caracteres a cumplir el String a evaluar.
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    maxLength(condition: number, message: string) : Validator {
        message = message.replace("%x", condition);
        const validate = evaluate => evaluate.length<=condition;
        return this.rule(validate, message);
    }

    // REGLAS DE FORMATO ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Verifica que el String a evaluar tenga un formato de correo electónico (email)
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    isEmail(message: string) : Validator {
        const RE = new RegExp("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$");
        const validate = evaluate => RE.test(evaluate.toLowerCase());
        return this.rule(validate, message);
    }

    /**
     * Verifica que el String a evaluar tenga un formato numérico.
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    isNumber(message: string) : Validator {
        const validate = evaluate => !isNaN(evaluate);
        return this.rule(validate, message);
    }

    // REGLA DE CONTENIDO //////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Verifica que el String a evaluar solo contenga caracteres incluidos en el String de condición.
     * @param condition String conformado por los caracteres validos.
     * @param message  Mensaje de error para esta regla.
     * @return Validator.
     */
    shouldOnlyContain(condition: string, message: string) : Validator {
        message = message.replace("%x", condition);
        const validate = evaluate => {
            for (let i=0; i<evaluate.length; i++) {
                const char = evaluate[i];
                if ( !~condition.indexOf(char) ) return false;
            }
            return true;
        };
        return this.rule(validate, message);
    }

    /**
     * Verifica que solo halla caracteres numéricos en el String a evaluar.
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    onlyNumber(message: string): Validator {
        return this.shouldOnlyContain("0123456789", message);
    }

    /**
     * Verifica que el String a evaluar no contenga algunos de los caracteres incluido en el String de la condición.
     * @param condition String que contiene los caracteres no deseados.
     * @param message Mensaje de error para esta regla.
     * @return Validator.
     */
    notContain(condition: string, message: string) : Validator {
        message = message.replace("%x", condition);
        const validate = evaluate => {
            for (let i=0; i<condition.length; i++) {
                const char = condition[i];
                if ( ~evaluate.indexOf(char) ) return false;
            }
            return true;
        };
        return this.rule(validate, message);
    }

}