import { PROPERTY } from './../settings'

/**
 * Check if the options of a Vue component contain the Vuetamin
 * property.
 *
 * @param {Object} options The options property from a Vue component.
 */
export function hasVuetaminOptions (options) {
  let definitions = options[PROPERTY]

  return definitions && typeof definitions === 'object'
}
