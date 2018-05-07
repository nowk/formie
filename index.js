"use strict";

import React from "react";

/**
 * formInput returns the the most minimum form structure for an input type
 *
 *    <label>
 *      {{label-text}}
 *      <input .../>
 *    </label>
 *
 * @param {Object} schema
 * @return {ReactElement}
 */

let formInput = function(schema) {
  let ele;

  // set some variables we'll need down the line but not (always) part of props
  // or not necessary
  let type  = schema.type;
  let label = schema.label;
  let key   = schema.key || schema.name;

  // our props object
  let props = {
    key:   key,
    type:  type,
    name:  schema.name,
    value: schema.value
  };

  // for these types, they don't have these attributes as part of the main
  // props
  if (~[
    "textarea",
    "select"
  ].indexOf(props.type)) {
    delete props.type;
    // TODO do we need to delete this for select/checkbox/radio delete
    // props.value;
  }

  switch(type) {
    case "text":
      ele = (
        <label key={labelKey(key)}>
          {label}
          <input {...props} />
        </label>
      )
    break;

    case "textarea":
      ele = (
        <label key={labelKey(key)}>
          {label}
          <textarea {...props} />
        </label>
      )
    break;

    case "select":
      let availableValues = schema.availableValues;

      if (schema.includeBlank) {
        availableValues.unshift([null, schema.includeBlank]);
      }

      let options  = [];
      let selected = buildOptions.call(options, availableValues, key, type);

      // defaultValue must always be an array
      props.defaultValue = (schema.defaultValue) ? flatten([schema.defaultValue]) : selected;
      props.multiple     = !!schema.multiple;

      // if it's not a multiple select grab only the first default value
      if (!props.multiple) {
        props.defaultValue = props.defaultValue[0];
      }

      ele = (
        <label key={labelKey(key)}>
          {label}
          <select {...props}>{options}</select>
        </label>
      )
    break;
  }

  return ele;
};

/**
 * flatten flattens an array
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

let flatten = function(arr) {
  return Array.prototype.concat.apply([], arr);
};

/**
 * labelKey suffixes _label to key
 *
 * @param {String} key
 * @return {String}
 * @api private
 */

let labelKey = function(key) {
  return key + "_label";
};

/**
 * buildOptions builds the <select> <option> array into a contexted array and
 * returns an array of default selected values (if applicable)
 *
 * Arrays can come in these formats
 *
 *    ["One", "Two", "Three"]
 *
 * Value and Text will both be the single value in the array. 
 *
 *    [
 *      [1, "One"],
 *      [2, "Two"],
 *      [3, "Tree"]
 *    ]
 *
 * Value is the first index (0) and the Text is the second (1).
 *
 *    [
 *      [1, "One"],
 *      [2, "Two", true],
 *      [3, "Tree"]
 *    ]
 *
 * A third index (2) can be provided to indicate it is a "selected" option,
 * otherwise providing a defaultValue as part of the schema is required to
 * define default selected options
 *
 * @param {Array} arr
 * @param {String} key
 * @param {String} type
 * @return {Array}
 * @this {Array}
 * @api private
 */

let buildOptions = function(arr, key, type) {
  var selected = [];
  var self     = this;

  arr.forEach(function(v, i) {
    let txt = v;
    let val = v;

    if (v instanceof Array) {
      val = v[0];
      txt = v[1];

      if (v.length === 3 && !!v[2]) {
        selected.push(val);
      }
    }

    let props = {
      key:   key + "_" + type + "_option_" + i,
      value: val
    };

    self.push(<option {...props}>{txt}</option>);
  });

  return selected;
};

export { formInput }

