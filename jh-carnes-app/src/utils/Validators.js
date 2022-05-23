import Validator from "./Validator";
import lang from "../assets/lang"

const name = new Validator()
    .notEmpty(lang.requiredValidatorMessage);

const description = new Validator()
    .notEmpty(lang.requiredValidatorMessage);

const price = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .shouldOnlyContain("0123456789.", lang.numberValid);

const category = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .rule( validate => validate!=="0", lang.requiredValidatorMessage );

const photo = new Validator()
    .notEmpty(lang.requireImgMsg)
    .rule( validate => validate!=="0", lang.requireImgMsg );

const lastname = new Validator()
    .notEmpty(lang.requiredValidatorMessage);

const email = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .isEmail(lang.emailValidatorMsg);

const phone = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .onlyNumber(lang.phoneValidatorMsg)
    .minLength(7, lang.phoneValidatorMsg);

const password = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .minLength(6, lang.passwordValidatorMsg);

const bill = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .rule( condition => condition!=="0", lang.requiredValidatorMessage);

const rode = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .rule( evaluate => {
        return evaluate!=="0";
    }, lang.requiredValidatorMessage);

const pointsChange = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .rule( condition => condition!=="0", lang.requiredValidatorMessage);

const client = new Validator()
    .notEmpty(lang.requiredValidatorMessage)
    .rule( condition => condition!=="0", lang.requiredValidatorMessage);

export default {
    name,
    description,
    price,
    category,
    photo,
    lastname,
    email,
    phone,
    password,
    bill,
    rode,
    pointsChange,
    client
}
