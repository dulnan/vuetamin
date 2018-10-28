import { PROPERTY } from './../settings'

/**
 * Check if the options of a Vue component contain the Vuetamin
 * property.
 *
 * @param {Object} options The options property from a Vue component.
 */
export const hasVuetaminOptions = options => {
  let definitions = options[PROPERTY]

  return definitions && typeof definitions === 'object'
}

/**
 * Build an identifier for a component's thread method.
 *
 * @param {Number} uid The UID of the Vue component.
 * @param {String} name Name of the method.
 */
export const buildKey = (uid, name) => {
  return `vue_${uid}_${name}`
}