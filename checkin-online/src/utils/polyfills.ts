function polyfillForEach() {
  if (!Array.prototype.forEach) {
    // eslint-disable-next-line no-extend-native
    Array.prototype.forEach = function (callback, thisArg) {
      let T, k;

      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }

      // 1. Положим O равным результату вызова ToObject passing the |this| value as the argument.
      let O = Object(this);

      // 2. Положим lenValue равным результату вызова внутреннего метода Get объекта O с аргументом "length".
      // 3. Положим len равным ToUint32(lenValue).
      let len = O.length >>> 0;

      // 4. Если IsCallable(callback) равен false, выкинем исключение TypeError.
      // Смотрите: http://es5.github.com/#x9.11
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }

      // 5. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
      if (arguments.length > 1) {
        T = thisArg;
      }

      // 6. Положим k равным 0
      k = 0;

      // 7. Пока k < len, будем повторять
      while (k < len) {
        let kValue;

        // a. Положим Pk равным ToString(k).
        //   Это неявное преобразование для левостороннего операнда в операторе in
        // b. Положим kPresent равным результату вызова внутреннего метода HasProperty объекта O с аргументом Pk.
        //   Этот шаг может быть объединён с шагом c
        // c. Если kPresent равен true, то
        if (k in O) {
          // i. Положим kValue равным результату вызова внутреннего метода Get объекта O с аргументом Pk.
          kValue = O[k];

          // ii. Вызовем внутренний метод Call функции callback с объектом T в качестве значения this и
          // списком аргументов, содержащим kValue, k и O.
          callback.call(T, kValue, k, O);
        }
        // d. Увеличим k на 1.
        k++;
      }
      // 8. Вернём undefined.
    };
  }
}

export {polyfillForEach};
