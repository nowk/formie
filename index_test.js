"use strict";

import React from "react";

import chai, { assert } from "chai";
import extend from "node.extend";
import { shallow, render } from "enzyme";
import { formInput } from "./";

class Sandbox extends React.Component {
  render() {
    let schema = this.props.__schema__;
    let input  = formInput(schema);

    return React.createElement("div", {}, input);
  }
}

describe("formInput", function() {
  it("basic input", function() {
    let props = {
      __schema__: {
        type: "text",
        name: "first_name",
        label: "First Name"
      }
    };

    let wrapper = shallow(<Sandbox {...props} />);

    let label = wrapper.find("label");
    assert.equal(label.text(), "First Name");
    assert.equal(label.key(), "first_name_label");

    let input = wrapper.find('input');
    assert.lengthOf(input, 1);
    assert.equal(input.prop("type"), "text");
    assert.equal(input.prop("name"), "first_name");
    assert.isUndefined(input.prop("value"));
  });

  it("defines a custom key", function() {
    let props = {
      __schema__: {
        type: "text",
        name: "first_name",
        label: "First Name",
        key: "a_custom_key"
      }
    };

    let wrapper = shallow(<Sandbox {...props} />);

    let label = wrapper.find("label");
    assert.equal(label.key(), "a_custom_key_label");
  });

  it("no label", function() {
    let props = {
      __schema__: {
        type: "text",
        name: "first_name"
      }
    };

    let wrapper = shallow(<Sandbox {...props} />);

    let label = wrapper.find("label");
    assert.equal(label.text(), "");
  });

  it("with value", function() {
    let props = {
      __schema__: {
        type: "text",
        name: "first_name",
        value: "Batman"
      }
    };

    let wrapper = shallow(<Sandbox {...props} />);

    let input = wrapper.find('input');
    assert.equal(input.prop("value"), "Batman");
  });

  describe("textarea", function() {
    it("textarea", function() {
      let props = {
        __schema__: {
          type: "textarea",
          name: "description"
        }
      };

      let wrapper = shallow(<Sandbox {...props} />);

      let textarea = wrapper.find("textarea");
      assert.lengthOf(textarea, 1);
      assert.equal(textarea.prop("name"), "description");
      assert.isUndefined(textarea.prop("value"));
      assert.isUndefined(textarea.prop("type"));
    });

    it("with a default value", function() {
      let props = {
        __schema__: {
          type: "textarea",
          name: "description",
          value: "Hello World!"
        }
      };

      let wrapper = shallow(<Sandbox {...props} />);

      let textarea = wrapper.find("textarea");
      assert.equal(textarea.prop("value"), "Hello World!");
    });
  });

  describe("select", function() {
    it("select", function() {
      let props = {
        __schema__: {
          type: "select",
          name: "which_number",
          label: "Choose a number",
          availableValues: ["One", "Two", "Three"]
        }
      };

      let wrapper = shallow(<Sandbox {...props} />);

      let label = wrapper.find("label");
      assert.equal(label.key(), "which_number_label");
      assert.match(label.text(), /Choose a number/);

      let select = label.find("select");
      assert.equal(select.prop("name"), "which_number");

      let options = select.find("option");
      [
        "One",
        "Two",
        "Three"
      ].forEach(function(v, i) {
        assert.equal(options.at(i).key(), "which_number_select_option_" + i);
        assert.equal(options.at(i).prop("value"), v);
        assert.equal(options.at(i).text(), v);
        assert.equal(options.at(i).prop("selected"), undefined);
      });
    });

    it("add a blank option", function() {
      let props = {
        __schema__: {
          type: "select",
          name: "which_number",
          availableValues: ["One"],
          includeBlank: true
        }
      };

      let wrapper = shallow(<Sandbox {...props} />);

      let options = wrapper.find("select option");
      assert.equal(options.at(0).key(), "which_number_select_option_0")
      assert.equal(options.at(0).prop("value"), undefined);
      assert.equal(options.at(0).text(), "");

      assert.equal(options.at(1).key(), "which_number_select_option_1")
      assert.equal(options.at(1).prop("value"), "One");
      assert.equal(options.at(1).text(), "One");
    });

    it("add a blank option with custom text", function() {
      let props = {
        __schema__: {
          type: "select",
          name: "which_number",
          availableValues: ["One"],
          includeBlank: "Please Select a Number"
        }
      };

      let wrapper = shallow(<Sandbox {...props} />);

      let options = wrapper.find("select option");
      assert.equal(options.at(0).key(), "which_number_select_option_0")
      assert.equal(options.at(0).prop("value"), undefined);
      assert.equal(options.at(0).text(), "Please Select a Number");
    });

    it("different value/text on options", function() {
      let props = {
        __schema__: {
          type: "select",
          name: "which_number",
          availableValues: [
            [1, "One"],
            [2, "Two"],
            [3, "Three"]
          ]
        }
      };

      let wrapper = shallow(<Sandbox {...props} />);

      let options = wrapper.find("select option");
      [
        [1, "One"],
        [2, "Two"],
        [3, "Three"]
      ].forEach(function(v, i) {
        assert.equal(options.at(i).key(), "which_number_select_option_" + i);
        assert.equal(options.at(i).prop("value"), v[0]);
        assert.equal(options.at(i).text(), v[1]);
        assert.equal(options.at(i).prop("selected"), undefined);
      });
    });

    it("default selected option", function() {
      let base = {
        __schema__: {
          type: "select",
          name: "which_number",
        }
      };

      let cases = [
        {
          __schema__: {
            availableValues: ["One", "Two", "Three"],
            defaultValue: "Two"
          }
        },
        {
          __schema__: {
            availableValues: [
              [1, "One"],
              [2, "Two", true],
              [3, "Three"],
            ]
          }
        }
      ];

      let i = 0;
      let j = cases.length;
      for(; i < j; i++) {
        let props   = extend(true, {}, base, cases[i]);
        let wrapper = render(<Sandbox {...props} />);

        let options = wrapper.find("select [selected]");
        assert.lengthOf(options, 1);
        assert.equal(options.text(), "Two");
      }
    });

    it("multiple selected values", function() {
      let base = {
        __schema__: {
          type: "select",
          name: "which_number",
          multiple: true
        }
      };

      let cases = [
        {
          __schema__: {
            availableValues: ["One", "Two", "Three"],
            defaultValue: ["Two", "One"]
          }
        },
        {
          __schema__: {
            availableValues: [
              [1, "One", true],
              [2, "Two", true],
              [3, "Three"]
            ],
          }
        }
      ];

      let i = 0;
      let j = cases.length;
      for(; i < j; i++) {
        let props   = extend(true, {}, base, cases[i]);
        let wrapper = render(<Sandbox {...props} />);

        let options = wrapper.find("select [selected]");
        assert.lengthOf(options, 2);
        assert.equal(options.eq(0).text(), "One");
        assert.equal(options.eq(1).text(), "Two");
      }
    });

    it("defaultValue overrides inline selected option", function() {
      let base = {
        __schema__: {
          type: "select",
          name: "which_number",
       
        }
      };

      {
        let props = extend(true, {}, base, {
          __schema__: {
            availableValues: [
              [1, "One", true],
              [2, "Two"]
            ],
            defaultValue: 2
          }
        });

        let wrapper = render(<Sandbox {...props} />);

        let options = wrapper.find("select [selected]");
        assert.equal(options.text(), "Two");
      }

      {
        let props = extend(true, {}, base, {
          __schema__: {
            multiple: true,
            availableValues: [
              [1, "One", true],
              [2, "Two", true],
              [3, "Three"]
            ],
            defaultValue: [2, 3]
          }
        });

        let wrapper = render(<Sandbox {...props} />);

        let options = wrapper.find("select [selected]");
        assert.lengthOf(options, 2);
        assert.equal(options.eq(0).text(), "Two");
        assert.equal(options.eq(1).text(), "Three");
      }
    });

  });
});

