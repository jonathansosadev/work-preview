export default function Enum(obj, staticMethods) {
  const keysByValue = new Map()
  const keys = Object.keys(obj)
  const values = []
  const EnumLookup = (value) => keysByValue.get(value)

  for (const key of keys) {
    EnumLookup[key] = obj[key]
    keysByValue.set(EnumLookup[key], key)
    values.push(obj[key])
  }
  EnumLookup.keys = () => keys
  EnumLookup.toString = () => JSON.stringify(obj)
  EnumLookup.toJSON = () => obj
  EnumLookup.type = 'string' // for Loopback type définition
  EnumLookup.values = () => values
  EnumLookup.hasValue = (value) => values.includes(value)
  if (staticMethods) {
    Object.keys(staticMethods).forEach((key) => {
      EnumLookup[key] = staticMethods[key]
    })
  }
  EnumLookup.translations = (language) => {
    if (!EnumLookup.displayName) return obj
    const formatted = {}
    keys.forEach((k) => {
      formatted[k] = {
        value: EnumLookup[k],
        name: EnumLookup.displayName(EnumLookup[k], language)
      }
    })
    return formatted
  }
  EnumLookup.isSupported = (type) => {
    for (let k = 0; k < keys.length; k++) {
      if (obj[keys[k]] === type) {
        return true
      }
    }
    return false
  }
  // Return a function with all your enum properties attached.
  // Calling the function with the value will return the key.
  return Object.freeze(EnumLookup)
}
