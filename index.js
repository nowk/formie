"use strict";

import React from "react";

/**
 * expandOpts applys kesy of object b on to object a returning the new a
 *
 * Note, this will ignore addition of non-supported react attributes
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api private
 */

let expandOpts = function(a, b) {
  for (let key in b) {
    switch(key) {
      case "includeBlank":
        continue;
      break;
    }

    a[key] = b[key];
  }

  return a;
};

/**
 * inputTag creates a <input />
 *
 * @param {String} type (text, email, radio, etc...)
 * @param {String} name
 * @param {String} value
 * @param {Object} opts (additional attrs to apply to props)
 * @return {ReactElement}
 * @api public
 */

let inputTag = function(type, name, value, opts) {
  let props = expandOpts({
    key:   name,
    type:  type,
    name:  name,
    value: value
  }, opts);

  return (<input {...props} />);
};

/**
 * textareaTag creates a <textarea></textarea>
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} opts (additional attrs to apply to props)
 * @return {ReactElement}
 * @api public
 */

let textareaTag = function(name, value, opts) {
  let props = expandOpts({
    key:   name,
    name:  name,
    value: value
  }, opts);

  return (<textarea {...props} />);
};

/**
 * select is a utility to create a full <select><option></option></select>
 *
 * @param {String} name
 * @param {Array} arr (an array of option values/texts)
 * @param {Multiple} selected (single or array of values denoting selected options)
 * @param {Object} opts (additional attrs to apply to props)
 * @return {ReactElement}
 * @api public
 */

let makeSelect = function(name, arr, selected, opts) {
  let key = name;
  if ("key" in opts) key = opts.key;

  // add a new blank option at the first spot of the arr, if applicable
  if ("includeBlank" in opts && !!opts.includeBlank) {
    arr.unshift([null, opts.includeBlank]);
  }

  let options   = [];
  let _selected = makeOptions.call(options, arr, key);

  // use the returned selected if we aren't provided one
  if (!!!selected) {
    selected = _selected; 
  }
  selected = flatten([selected]); // force to array, this is for the next step

  // if it's not multiple only use the first option
  if ("multiple" in opts && !!!opts.multiple) {
    selected = selected[0];
  }

  return selectTag(name, options, selected, opts);
};

/**
 * selectTag creates a <select>...</select>
 *
 * @param {String} name
 * @param {Array} options (array of react <option> elements)
 * @param {Multiple} selected (single or array of values denoting selected options)
 * @para {Object} opts (additional attrs to apply to props)
 * @return {ReactElement}
 * @api public
 */

let selectTag = function(name, options, selected, opts) {
  let props = expandOpts({
    key:          name,
    name:         name,
    defaultValue: selected
  }, opts);

  return (<select {...props}>{options}</select>);
};

/**
 * optionTag creates an <option></option>
 *
 * @param {String} text
 * @param {Multipe} value
 * @param {String} key (react key value, this should be unique for each option created)
 * @return {ReactElement}
 * @api public
 */

let optionTag = function(text, value, key) {
  let props = {
    key:   key,
    value: value
  };

  return (<option {...props}>{text}</option>);
};

/**
 * makeOptions creates <option></option> sets from a given array
 *
 * Note, this must be called using apply/call on an array
 *
 *     let options = [];
 *     let selected = makeOptions.call(options, [...], "a_key");
 *
 * @param {Array} arr (array of values to create options from)
 * @param {String} key (react key value, is will be used as a base to create a unique key value for each option)
 * @return {Array} (array of selected values)
 * @this {Array}
 * @api public
 */

let makeOptions = function(arr, key) {
  let selected = [];
  let self     = this;

  arr.forEach(function(v, i) {
    let val = v;
    let txt = v;
    if (v instanceof Array) {
      val = v[0];
      txt = v[1];

      // if has a 3rd place index, it's an inline 'selected' marker
      if (v.length === 3 && !!v[1]) {
        selected.push(val);
      }
    }

    self.push(optionTag(txt, val, key + "_select_option_" + i));
  });

  return selected;
}

let labelTag = function(label, key, ele) {
  return (
    <label key={key}>
      {label}
      {ele}
    </label>
  );
};

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
  let label = schema.label || schema.name;
  let key   = schema.key || schema.name;
  let _name = schema.name; // NOTE _name is because in switch, `name` becomes undefined
  let value = schema.value;

  // if label is falsy then use then
  if (schema.label === false) {
    label = "";
  }

  // our props object
  let props = {
    key:   key,
    type:  type,
    name:  schema.name,
    value: schema.value
  };


  switch(type) {
    case "text": {
      let opts  = {key: key};
      let input = inputTag(type, _name, value, opts);

      ele = labelTag(label, labelKey(key), input);
      break;
    }

    case "textarea": {
      let opts     = {key: key};
      let textarea = textareaTag(_name, value, opts);

      ele = labelTag(label, labelKey(key), textarea);
      break;
    }

    case "select": {
      let opts = {
        key:          key,
        multiple:     !!schema.multiple,
        includeBlank: schema.includeBlank
      };
      let select = makeSelect(_name, schema.availableValues, schema.value, opts);

      ele = labelTag(label, labelKey(key), select);
      break;
    }

    case "radio":
    case "checkbox":
      let name  = schema.name;
      let elems = [];
      schema.availableValues.forEach(function(v, i) {
        let checked = false;

        let val = v;
        let txt = v;
        if (v instanceof Array) {
          val = v[0];
          txt = v[1];

          if (v.length === 3) checked = !!v[2];
        }

        let inputProps = {
          id:           type + "_" + name + "_" + i,
          key:          key + "_" + type + "_" + i,
          type:         type,
          name:         name,
          defaultValue: val
        };

        if (schema.defaultValue instanceof Array) {
          if (~schema.defaultValue.indexOf(val)) {
            inputProps.defaultChecked = "checked";
          }
        } else {
          if (schema.defaultValue === val || checked) inputProps.defaultChecked = "checked";
        }

        elems.push(<input {...inputProps} />);
        elems.push(<label htmlFor={inputProps.id} key={name + "_label_" + i}>{txt}</label>)
      });

      ele = (
        <fieldset key={key}>
          <legend key={key + "_legend"}>{label}</legend>
          {elems}
        </fieldset>
      );
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

export { formInput }

