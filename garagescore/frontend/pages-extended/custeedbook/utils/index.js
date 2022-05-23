// it helps built the props for your component

const typeToProps = {
  Boolean: {
    value: true,
    inputType: 'checkbox'
  },
  Object: {
    value: {},
    inputType: 'json'
  },
  Array: {
    value: [],
    inputType: 'json'
  },
  Number: {
    value: 1,
    inputType: 'number'
  },
  String: {
    value: '',
    inputType: 'text'
  },
  undefined: {
    value: '',
    inputType: ''
  },
  Function: {
      value: () => {
          alert('Function')
      },
  }
}

const extractComponentName = (path) => {
try {
  return path.split('/').pop().split('.').shift()
} catch {
  return '';
}
}

export const extractCategory = (path) => {
try {
  return path.split('/components/').pop().split('/').shift();
} catch {
  return '';
}
}

export const getProps = (component) => {
return {
  [`${component.name || extractComponentName(component.__file)}Props`]: component.props ? Object.entries(component.props).map(prop => {
    const [label, propValue] = prop;
    if (!propValue.type) {
      return {
        label,
        value: typeToProps[propValue.name].value,
        inputType: typeToProps[propValue.name].inputType,
      }
    }
    return {
      label,
      value: propValue.default || propValue.type.name && (typeof propValue.type === 'function') && typeToProps[propValue.type.name].value,
      inputType: propValue.type && (typeof propValue.type === 'function') && typeToProps[propValue.type.name].inputType,
    }
  }) : []
}
}